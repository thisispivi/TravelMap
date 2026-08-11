import "./PhotoImportDialog.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import type { Image, TripStopJson } from "@travelmap/core";
import { Check, FileUp, X } from "lucide-react";
import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";

import type { DatasetSnapshot } from "../../../../data/store";
import { applyWrites } from "../../../../data/store";
import { snapshotBeforeChange } from "../../../backup/lib/snapshots";
import type {
  ParsedPhotoManifest,
  PhotoManifestImage,
} from "../../lib/photoManifest";
import {
  manifestKeyFor,
  manifestPathForStop,
  parseManifest,
} from "../../lib/photoManifest";

/** Which stage of the photo import the author is reviewing. */
type Stage = "input" | "review" | "done";

/**
 * PhotoImportDialog component
 * Validates uploader output, resolves its canonical dataset path, collects
 * missing YouTube identifiers, and writes the manifest as one backed-up edit.
 * @component
 * @param {PhotoImportDialogProps} props
 * @param {DatasetSnapshot} props.dataset - Current editor dataset
 * @param {() => void} props.onClose - Dismisses the dialog
 * @param {(step: TripStopJson) => void} props.onChange - Updates the stop reference
 * @param {TripStopJson} props.step - Stop receiving the imported manifest
 * @returns {ReactNode} The photo import dialog
 */
export function PhotoImportDialog({
  dataset,
  onChange,
  onClose,
  step,
}: PhotoImportDialogProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedPhotoManifest | null>(null);
  const [images, setImages] = useState<PhotoManifestImage[]>([]);
  const [stage, setStage] = useState<Stage>("input");
  const [message, setMessage] = useState("");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const path = manifestPathForStop(dataset, step);
  const existing = dataset.photos.find((file) => file.path === path);
  const hasErrors =
    parsed?.problems.some(({ severity }) => severity === "error") ?? false;
  const missingVideoIndexes =
    parsed?.problems.flatMap((problem) =>
      problem.code === "missingOriginal" && problem.index !== undefined
        ? [problem.index]
        : [],
    ) ?? [];
  const visibleProblems =
    parsed?.problems.filter(
      (problem) =>
        problem.code !== "missingOriginal" ||
        problem.index === undefined ||
        !images[problem.index]?.original?.trim(),
    ) ?? [];
  const hasMissingVideoId = missingVideoIndexes.some(
    (index) => !images[index]?.original?.trim(),
  );

  /**
   * Reads selected uploader JSON into the paste area for review.
   * @param {ChangeEvent<HTMLInputElement>} event - Native file selection
   * @returns {Promise<void>} Completion once the browser reads the file
   */
  async function handleFile(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];
    if (file) setText(await file.text());
  }

  /**
   * Validates the current input and opens the resolved-path review.
   * @returns {void}
   */
  function handleReview(): void {
    const result = parseManifest(
      text,
      dataset.config.value.media?.root ?? "/Travels",
    );
    setParsed(result);
    setImages(result.images);
    setMessage("");
    setStage("review");
  }

  /**
   * Adds the YouTube identifier required by an uploader video entry.
   * @param {number} index - Manifest entry position
   * @param {string} original - YouTube video identifier
   * @returns {void}
   */
  function setYoutubeId(index: number, original: string): void {
    setImages((current) =>
      current.map((image, position) =>
        position === index ? { ...image, original, youtube: true } : image,
      ),
    );
  }

  /**
   * Narrows reviewed entries to the complete public manifest shape.
   * @returns {Image[]} Complete entries, or an empty list while an id is missing
   */
  function completedImages(): Image[] {
    if (images.some((image) => !image.original?.trim())) return [];
    return images.flatMap((image) =>
      image.original ? [{ ...image, original: image.original.trim() }] : [],
    );
  }

  /**
   * Snapshots the dataset, writes the manifest, and links the stop to it.
   * @returns {Promise<void>} Completion once the manifest is on disk
   */
  async function handleApply(): Promise<void> {
    const complete = completedImages();
    if (hasErrors || complete.length !== images.length) return;
    try {
      await snapshotBeforeChange("before photo manifest import");
      await applyWrites([{ path, value: complete }]);
      onChange({ ...step, photoPath: manifestKeyFor(path) });
      setStage("done");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("photoImport.failed"),
      );
    }
  }

  return (
    <dialog
      aria-label={t("photoImport.title")}
      className="photo-import-dialog"
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <h2 className="photo-import-dialog__title">{t("photoImport.title")}</h2>
      {stage === "input" ? (
        <>
          <p className="editor-panel__hint">{t("photoImport.hint")}</p>
          <label className="editor-field">
            <span className="editor-field__label">
              {t("photoImport.paste")}
            </span>
            <textarea
              className="editor-field__control editor-field__control--area"
              onChange={(event) => setText(event.target.value)}
              rows={10}
              value={text}
            />
          </label>
          <div className="photo-import-dialog__actions">
            <label className="editor-button photo-import-dialog__file-button">
              <FileUp aria-hidden="true" />
              {t("photoImport.chooseFile")}
              <input
                accept=".json"
                className="photo-import-dialog__file"
                onChange={handleFile}
                type="file"
              />
            </label>
            <button
              className="editor-button editor-button--primary"
              disabled={!text.trim()}
              onClick={handleReview}
              type="button"
            >
              <Check aria-hidden="true" />
              {t("photoImport.review")}
            </button>
          </div>
        </>
      ) : null}
      {stage === "review" && parsed ? (
        <>
          <dl className="photo-import-dialog__summary">
            <div className="photo-import-dialog__summary-row">
              <dt>{t("photoImport.entries")}</dt>
              <dd>{images.length}</dd>
            </div>
            <div className="photo-import-dialog__summary-row">
              <dt>{t("photoImport.target")}</dt>
              <dd>
                <code>{path}</code>
              </dd>
            </div>
            {existing ? (
              <div className="photo-import-dialog__summary-row">
                <dt>{t("photoImport.existing")}</dt>
                <dd>
                  {t("photoImport.existingEntries", {
                    count: existing.value.length,
                  })}
                </dd>
              </div>
            ) : null}
          </dl>
          {visibleProblems.length > 0 ? (
            <ul
              className={classNames(
                "editor-notice",
                hasErrors ? "editor-notice--error" : "editor-notice--warning",
              )}
            >
              {visibleProblems.map((problem, index) => (
                <li
                  className="editor-notice__item"
                  key={`${problem.code}-${problem.index ?? index}-${problem.path ?? ""}`}
                >
                  {t(`photoImport.problem.${problem.code}`, {
                    path: problem.path,
                    position:
                      problem.index === undefined
                        ? undefined
                        : problem.index + 1,
                    root: dataset.config.value.media?.root ?? "/Travels",
                  })}
                </li>
              ))}
            </ul>
          ) : null}
          {missingVideoIndexes.length > 0 ? (
            <div className="photo-import-dialog__video-fields">
              {missingVideoIndexes.map((index) => (
                <label className="editor-field" key={images[index].thumbnail}>
                  <span className="editor-field__label">
                    {t("photoImport.youtubeId", { position: index + 1 })}
                  </span>
                  <input
                    className="editor-field__control"
                    onChange={(event) =>
                      setYoutubeId(index, event.target.value)
                    }
                    placeholder="dQw4w9WgXcQ"
                    value={images[index]?.original ?? ""}
                  />
                </label>
              ))}
            </div>
          ) : null}
          <div className="photo-import-dialog__actions">
            <button
              className="editor-button editor-button--primary"
              disabled={hasErrors || hasMissingVideoId || images.length === 0}
              onClick={handleApply}
              type="button"
            >
              <Check aria-hidden="true" />
              {existing ? t("photoImport.replace") : t("photoImport.import")}
            </button>
            <button
              className="editor-button"
              onClick={() => setStage("input")}
              type="button"
            >
              {t("photoImport.back")}
            </button>
          </div>
        </>
      ) : null}
      {stage === "done" ? (
        <p className="editor-notice editor-notice--success">
          <span className="editor-notice__item">{t("photoImport.done")}</span>
        </p>
      ) : null}
      <output className="editor-form__message">{message}</output>
      <footer className="photo-import-dialog__footer">
        <button className="editor-button" onClick={onClose} type="button">
          <X aria-hidden="true" />
          {stage === "done" ? t("photoImport.close") : t("editorForm.cancel")}
        </button>
      </footer>
    </dialog>
  );
}

/**
 * Props for PhotoImportDialog.
 * @property {DatasetSnapshot} dataset - Current editor dataset
 * @property {() => void} onClose - Dismisses the dialog
 * @property {(step: TripStopJson) => void} onChange - Updates the stop reference
 * @property {TripStopJson} step - Stop receiving the imported manifest
 */
interface PhotoImportDialogProps {
  dataset: DatasetSnapshot;
  onClose: () => void;
  onChange: (step: TripStopJson) => void;
  step: TripStopJson;
}
