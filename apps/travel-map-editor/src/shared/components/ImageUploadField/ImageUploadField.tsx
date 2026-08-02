import "./ImageUploadField.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { ReactNode, useEffect, useState } from "react";

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
 * @param {(path: string) => void} props.onUpload - Called with the new public path once the upload succeeds
 * @param {string} [props.value] - Current logo path, shown as a preview
 * @returns {ReactNode} The labelled upload control
 */
export function ImageUploadField({
  fileNameHint,
  hint,
  label,
  onUpload,
  value,
}: ImageUploadFieldProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // The editor's dev server can't resolve a just-uploaded file's public path
  // until the next reload (Vite's eager glob captured the module graph before
  // this file existed), so the picked file's own bytes stand in as the
  // preview until then.
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
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : t("imageUploadField.uploadFailed"),
      );
    } finally {
      setIsUploading(false);
    }
  }
  const previewSrc = previewOverride ?? value;
  return (
    <label className="editor-field">
      <span className="editor-field__label">{label}</span>
      <div className="image-upload-field__row">
        {previewSrc ? (
          <img
            alt=""
            className="image-upload-field__preview"
            src={previewSrc}
          />
        ) : (
          <span className="image-upload-field__preview image-upload-field__preview--none" />
        )}
        <input
          accept=".svg,.png"
          className="image-upload-field__input"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
          type="file"
        />
      </div>
      {error ? (
        <span className="editor-field__hint">{error}</span>
      ) : isUploading ? (
        <span className="editor-field__hint">
          {t("imageUploadField.uploading")}
        </span>
      ) : hint ? (
        <span className="editor-field__hint">{hint}</span>
      ) : null}
    </label>
  );
}

/**
 * Props for ImageUploadField.
 * @property {string} fileNameHint - Destination filename, without extension
 * @property {string} [hint] - Guidance shown under the control
 * @property {string} label - Field label
 * @property {(path: string) => void} onUpload - Called with the new public path once the upload succeeds
 * @property {string} [value] - Current logo path, shown as a preview
 */
interface ImageUploadFieldProps {
  fileNameHint: string;
  hint?: string;
  label: string;
  onUpload: (path: string) => void;
  value?: string;
}
