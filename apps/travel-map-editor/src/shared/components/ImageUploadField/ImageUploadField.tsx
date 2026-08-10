import "./ImageUploadField.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { Image, UploadCloud, X } from "lucide-react";
import { DragEvent, ReactNode, useEffect, useId, useState } from "react";

import { useToast } from "../Toast/Toast";

const ASSET_WRITE_ENDPOINT = "/__assets/write";

/**
 * The asset writer's response to a successful upload.
 * @property {string} path - The public path the logo is now served from
 */
interface UploadResponse {
  path: string;
}

/**
 * Reads a file's contents as a bare base64 string, without the
 * `data:*;base64,` prefix `FileReader.readAsDataURL` includes.
 * @param {File} file - The picked file
 * @returns {Promise<string>} The file's base64-encoded contents
 */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolvePromise(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => rejectPromise(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

/**
 * ImageUploadField component
 * A labelled file picker that uploads an SVG or PNG to the editor's local dev
 * server and reports back the resulting public path. Named after
 * `fileNameHint` rather than the picked file's own name, so re-uploading a
 * logo always replaces the same file instead of accumulating copies.
 * @component
 * @param {ImageUploadFieldProps} props
 * @param {string} props.fileNameHint - Destination filename, without extension
 * @param {string} [props.hint] - Guidance shown under the control
 * @param {string} props.label - Field label
 * @param {() => void} [props.onClear] - Removes the current image
 * @param {(path: string) => void} props.onUpload - Called with the new public path once the upload succeeds
 * @param {string} [props.value] - Current logo path, shown as a preview
 * @returns {ReactNode} The labelled upload control
 */
export function ImageUploadField({
  fileNameHint,
  hint,
  label,
  onClear,
  onUpload,
  value,
}: ImageUploadFieldProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const { showToast } = useToast();
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewOverride, setPreviewOverride] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewOverride) URL.revokeObjectURL(previewOverride);
    };
  }, [previewOverride]);

  /**
   * Uploads the picked file and reports its resulting public path.
   * @param {File} file - The picked file
   * @returns {Promise<void>} Completion once the upload settles
   */
  async function upload(file: File): Promise<void> {
    setError(null);
    setIsUploading(true);
    setPreviewOverride(URL.createObjectURL(file));
    try {
      const base64 = await readFileAsBase64(file);
      const extension = file.name.slice(file.name.lastIndexOf("."));
      const response = await fetch(ASSET_WRITE_ENDPOINT, {
        body: JSON.stringify({
          base64,
          filename: `${fileNameHint}${extension}`,
        }),
        method: "POST",
      });
      const body = (await response.json()) as UploadResponse & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(body.error ?? t("imageUploadField.uploadFailed"));
      onUpload(body.path);
      showToast(t("toast.logoUploaded"));
    } catch (uploadError) {
      const errorMessage =
        uploadError instanceof Error
          ? uploadError.message
          : t("imageUploadField.uploadFailed");
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsUploading(false);
    }
  }

  /**
   * Uploads the first supported image dropped onto the selector.
   * @param {DragEvent<HTMLLabelElement>} event - File drop event
   * @returns {void}
   */
  function handleDrop(event: DragEvent<HTMLLabelElement>): void {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void upload(file);
  }

  const previewSrc = previewOverride ?? value;
  return (
    <div className="editor-field image-upload-field">
      <span className="editor-field__label" id={`${inputId}-label`}>
        {label}
      </span>
      <label
        className={classNames(
          "image-upload-field__dropzone",
          isDragging ? "image-upload-field__dropzone--dragging" : "",
        )}
        htmlFor={inputId}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        {previewSrc ? (
          <img
            alt=""
            className="image-upload-field__preview"
            src={previewSrc}
          />
        ) : (
          <span className="image-upload-field__preview image-upload-field__preview--none">
            <Image aria-hidden="true" />
          </span>
        )}
        <span className="image-upload-field__copy">
          <strong>
            <UploadCloud aria-hidden="true" />
            {t("imageUploadField.choose")}
          </strong>
          <span>{t("imageUploadField.dropHint")}</span>
        </span>
        <input
          accept=".svg,.png"
          className="image-upload-field__input"
          id={inputId}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
          type="file"
        />
      </label>
      {previewSrc && onClear ? (
        <button
          className="image-upload-field__clear"
          onClick={onClear}
          type="button"
        >
          <X aria-hidden="true" />
          {t("imageUploadField.remove")}
        </button>
      ) : null}
      {error ? (
        <span className="editor-field__hint">{error}</span>
      ) : isUploading ? (
        <span className="editor-field__hint">
          {t("imageUploadField.uploading")}
        </span>
      ) : hint ? (
        <span className="editor-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}

/**
 * Props for ImageUploadField.
 * @property {string} fileNameHint - Destination filename, without extension
 * @property {string} [hint] - Guidance shown under the control
 * @property {string} label - Field label
 * @property {() => void} [onClear] - Removes the current image
 * @property {(path: string) => void} onUpload - Called with the new public path once the upload succeeds
 * @property {string} [value] - Current logo path, shown as a preview
 */
interface ImageUploadFieldProps {
  fileNameHint: string;
  hint?: string;
  label: string;
  onClear?: () => void;
  onUpload: (path: string) => void;
  value?: string;
}
