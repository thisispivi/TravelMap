import "./PhotosField.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { Images, Upload } from "lucide-react";
import { ReactNode, useState } from "react";

import { photoKeys } from "../../../../data/dataset";
import { DatasetSnapshot } from "../../../../data/store";
import { Combobox } from "../../../../shared/components/Combobox/Combobox";
import { canImportForVisit, PhotoVisit } from "../../lib/photoManifest";
import { PhotoImportDialog } from "../PhotoImportDialog/PhotoImportDialog";
import { UploadPanel } from "../UploadPanel/UploadPanel";

/**
 * Properties accepted by the PhotosField component.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {PhotoVisit} visit - The visit the photos belong to
 * @property {string} [photoPath] - The linked gallery, when there is one
 * @property {(photoPath: string | undefined) => void} onChange - Links or unlinks a gallery
 */
interface PhotosFieldProps {
  dataset: DatasetSnapshot;
  visit: PhotoVisit;
  photoPath?: string;
  onChange: (photoPath: string | undefined) => void;
}

/**
 * PhotosField component
 * Links a visit to its gallery: pick an existing one, upload photos and videos
 * straight into it, or import a manifest made elsewhere.
 * Used for stays and for places seen on a day trip or along a journey, which
 * is why it takes a visit rather than a step.
 * @component
 * @param {PhotosFieldProps} props - The field props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {PhotoVisit} props.visit - The visit the photos belong to
 * @param {string} [props.photoPath] - The linked gallery, when there is one
 * @param {(photoPath: string | undefined) => void} props.onChange - Links or unlinks a gallery
 * @returns {ReactNode} The photos field
 */
export function PhotosField({
  dataset,
  visit,
  photoPath,
  onChange,
}: PhotosFieldProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [isImporting, setIsImporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const canAttach = canImportForVisit(dataset, visit);

  return (
    <div className="photos-field">
      <Combobox
        emptyLabel={t("stepFields.noPhotos")}
        label={t("story.photos")}
        onChange={(next) => onChange(next || undefined)}
        options={photoKeys(dataset).map((path) => ({
          label: path,
          value: path,
        }))}
        value={photoPath ?? ""}
      />
      <button
        className="editor-button editor-button--primary photos-field__action"
        disabled={!canAttach}
        onClick={() => setIsUploading(true)}
        type="button"
      >
        <Upload aria-hidden="true" />
        {t("upload.open")}
      </button>
      <button
        className="editor-button photos-field__action"
        disabled={!canAttach}
        onClick={() => setIsImporting(true)}
        title={t("photoImport.title")}
        type="button"
      >
        <Images aria-hidden="true" />
        {t("photoImport.open")}
      </button>
      {isUploading ? (
        <UploadPanel
          dataset={dataset}
          onClose={() => setIsUploading(false)}
          onLink={onChange}
          visit={visit}
        />
      ) : null}
      {isImporting ? (
        <PhotoImportDialog
          dataset={dataset}
          onClose={() => setIsImporting(false)}
          onLink={onChange}
          visit={visit}
        />
      ) : null}
    </div>
  );
}
