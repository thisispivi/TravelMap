import "./UploadPanel.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { CloudUpload, HardDrive, Upload, X } from "lucide-react";
import {
  ChangeEvent,
  DragEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { applyWrites, DatasetSnapshot } from "../../../../data/store";
import { snapshotBeforeChange } from "../../../backup/lib/snapshots";
import {
  manifestKeyFor,
  manifestPathForVisit,
  PhotoVisit,
} from "../../lib/photoManifest";
import {
  fetchMediaConfig,
  MediaConfig,
  nextManifest,
  UPLOAD_CONCURRENCY,
  uploadFile,
  UploadItem,
} from "../../lib/uploadQueue";

/**
 * Properties accepted by the UploadPanel component.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {PhotoVisit} visit - The visit the photos belong to
 * @property {(photoPath: string) => void} onLink - Points the visit at its gallery
 * @property {() => void} onClose - Dismisses the panel
 */
interface UploadPanelProps {
  dataset: DatasetSnapshot;
  visit: PhotoVisit;
  onLink: (photoPath: string) => void;
  onClose: () => void;
}

/**
 * UploadPanel component
 * Drop photos and videos, watch each one upload and get processed, and find
 * them in the visit's gallery when it finishes — no script, no JSON to paste.
 * Uploads run a few at a time; one failure leaves the rest alone and can be
 * retried on its own.
 * @component
 * @param {UploadPanelProps} props - The panel props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {PhotoVisit} props.visit - The visit the photos belong to
 * @param {(photoPath: string) => void} props.onLink - Points the visit at its gallery
 * @param {() => void} props.onClose - Dismisses the panel
 * @returns {ReactNode} The upload dialog
 */
export function UploadPanel({
  dataset,
  visit,
  onLink,
  onClose,
}: UploadPanelProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [config, setConfig] = useState<MediaConfig | null>(null);
  const [target, setTarget] = useState<"local" | "bunny">("local");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dialogRef.current?.showModal();
    fetchMediaConfig()
      .then((next) => {
        setConfig(next);
        if (next.bunny) setTarget("bunny");
      })
      .catch(() => setMessage(t("upload.configFailed")));
  }, [t]);

  const countryId =
    dataset.cities.find(({ value }) => value.id === visit.cityId)?.value
      .countryId ?? "";
  const path = manifestPathForVisit(dataset, visit);
  const isBusy = items.some(({ status }) =>
    ["waiting", "uploading", "processing"].includes(status),
  );
  const done = items.filter(({ status }) => status === "done").length;

  /**
   * Changes one row of the list.
   * @param {string} id - The row
   * @param {Partial<UploadItem>} change - What changed
   * @returns {void}
   */
  const patch = (id: string, change: Partial<UploadItem>): void =>
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...change } : item)),
    );

  /**
   * Uploads a set of rows a few at a time, then writes every successful one
   * into the visit's gallery in a single backed-up edit.
   * @param {UploadItem[]} queue - Rows to upload
   * @returns {Promise<void>} Completion once the gallery is written
   */
  async function runQueue(queue: UploadItem[]): Promise<void> {
    const finished: UploadItem[] = [];
    const pending = [...queue];

    /**
     * Takes rows off the shared queue until it is empty.
     * @returns {Promise<void>} Completion when no rows are left
     */
    const worker = async (): Promise<void> => {
      for (let item = pending.shift(); item; item = pending.shift()) {
        const { id } = item;
        patch(id, { error: undefined, progress: 0, status: "uploading" });
        try {
          const image = await uploadFile(
            item.file,
            { city: visit.cityId, country: countryId, target },
            (progress) =>
              patch(id, {
                progress,
                status: progress >= 1 ? "processing" : "uploading",
              }),
          );
          patch(id, { image, progress: 1, status: "done" });
          finished.push({ ...item, image });
        } catch (error) {
          patch(id, {
            error: error instanceof Error ? error.message : String(error),
            status: "failed",
          });
        }
      }
    };

    await Promise.all(
      Array.from({ length: UPLOAD_CONCURRENCY }, () => worker()),
    );
    if (finished.length === 0) return;

    try {
      const existing =
        dataset.photos.find((file) => file.path === path)?.value ?? [];
      await snapshotBeforeChange("before photo upload");
      await applyWrites([
        {
          path,
          value: nextManifest(
            existing,
            finished.map(({ file, image }) => ({
              image: image!,
              takenAt: file.lastModified,
            })),
          ),
        },
      ]);
      onLink(manifestKeyFor(path));
      setMessage(t("upload.saved", { count: finished.length }));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("upload.saveFailed"),
      );
    }
  }

  /**
   * Queues files and starts uploading them straight away, because choosing
   * them is the intent.
   * @param {FileList | null} files - The chosen files
   * @returns {void}
   */
  function addFiles(files: FileList | null): void {
    const added: UploadItem[] = Array.from(files ?? [], (file) => ({
      file,
      id: `${file.name}-${file.size}-${file.lastModified}`,
      progress: 0,
      status: "waiting",
    }));
    if (added.length === 0) return;
    setMessage("");
    setItems((current) => [
      ...current.filter((item) => !added.some(({ id }) => id === item.id)),
      ...added,
    ]);
    void runQueue(added);
  }

  /**
   * Takes files dropped onto the panel.
   * @param {DragEvent<HTMLElement>} event - The drop
   * @returns {void}
   */
  function handleDrop(event: DragEvent<HTMLElement>): void {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  /**
   * Takes files chosen through the file picker.
   * @param {ChangeEvent<HTMLInputElement>} event - The picker change
   * @returns {void}
   */
  function handlePick(event: ChangeEvent<HTMLInputElement>): void {
    addFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <dialog
      aria-label={t("upload.title")}
      className="upload-panel"
      onCancel={(event) => (isBusy ? event.preventDefault() : onClose())}
      onClose={onClose}
      ref={dialogRef}
    >
      <h2 className="upload-panel__title">{t("upload.title")}</h2>
      <fieldset className="upload-panel__targets" disabled={isBusy}>
        <legend className="editor-field__label">{t("upload.where")}</legend>
        <label
          className={classNames(
            "upload-panel__target",
            target === "local" && "upload-panel__target--selected",
          )}
        >
          <input
            checked={target === "local"}
            className="upload-panel__target-input"
            name="upload-target"
            onChange={() => setTarget("local")}
            type="radio"
          />
          <HardDrive aria-hidden="true" />
          {t("upload.local")}
        </label>
        <label
          className={classNames(
            "upload-panel__target",
            target === "bunny" && "upload-panel__target--selected",
            !config?.bunny && "upload-panel__target--disabled",
          )}
        >
          <input
            checked={target === "bunny"}
            className="upload-panel__target-input"
            disabled={!config?.bunny}
            name="upload-target"
            onChange={() => setTarget("bunny")}
            type="radio"
          />
          <CloudUpload aria-hidden="true" />
          {config?.bunny ? t("upload.bunny") : t("upload.bunnyMissing")}
        </label>
      </fieldset>

      <label
        className={classNames(
          "upload-panel__drop",
          isDragging && "upload-panel__drop--active",
        )}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={handleDrop}
      >
        <Upload aria-hidden="true" className="upload-panel__drop-icon" />
        <span className="upload-panel__drop-text">{t("upload.drop")}</span>
        <span className="upload-panel__drop-hint">
          {config?.ffmpeg ? t("upload.hint") : t("upload.hintNoVideo")}
        </span>
        <input
          accept={config?.ffmpeg ? "image/*,video/*" : "image/*"}
          className="upload-panel__file"
          multiple
          onChange={handlePick}
          type="file"
        />
      </label>

      {items.length > 0 ? (
        <ul className="upload-panel__list">
          {items.map((item) => (
            <li className="upload-panel__item" key={item.id}>
              <span className="upload-panel__name">{item.file.name}</span>
              <progress
                aria-label={t("upload.progress", { name: item.file.name })}
                className={classNames(
                  "upload-panel__bar",
                  item.status === "failed" && "upload-panel__bar--failed",
                )}
                max={1}
                value={item.status === "processing" ? undefined : item.progress}
              />
              <span
                className={classNames(
                  "upload-panel__status",
                  item.status === "failed" && "upload-panel__status--failed",
                )}
              >
                {item.status === "failed"
                  ? (item.error ?? t("upload.status.failed"))
                  : item.status === "done" && item.image?.youtube
                    ? t("upload.videoDone")
                    : t(`upload.status.${item.status}`, {
                        percent: Math.round(item.progress * 100),
                      })}
              </span>
              {item.status === "failed" ? (
                <button
                  className="editor-button"
                  disabled={isBusy}
                  onClick={() => void runQueue([item])}
                  type="button"
                >
                  {t("upload.retry")}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="upload-panel__footer">
        <output className="upload-panel__message">
          {message ||
            (items.length > 0
              ? t("upload.summary", { done, total: items.length })
              : "")}
        </output>
        <button
          className="editor-button"
          disabled={isBusy}
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" />
          {t("upload.close")}
        </button>
      </footer>
    </dialog>
  );
}
