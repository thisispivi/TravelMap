import "./PhotosField.scss";

import { PhotoRange } from "@travelmap/core";
import { Button } from "@travelmap/ui/components/Button/Button";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { Images, Upload } from "lucide-react";
import { ReactNode, useState } from "react";

import { photoKeys } from "../../../../data/dataset";
import { DatasetSnapshot } from "../../../../data/store";
import { Combobox } from "../../../../shared/components/Combobox/Combobox";
import { NumberField } from "../../../../shared/components/Fields/Fields";
import { canImportForVisit, PhotoVisit } from "../../lib/photoManifest";
import { PhotoImportDialog } from "../PhotoImportDialog/PhotoImportDialog";
import { UploadPanel } from "../UploadPanel/UploadPanel";

/**
 * Properties accepted by the PhotosField component.
 * @property {DatasetSnapshot} dataset - The current dataset
 * @property {PhotoVisit} visit - The visit the photos belong to
 * @property {string} [photoPath] - The linked gallery, when there is one
 * @property {(photoPath: string | undefined) => void} onChange - Links or unlinks a gallery
 * @property {PhotoRange} [photoRange] - The part of the gallery this visit owns
 * @property {(photoRange: PhotoRange | undefined) => void} onRangeChange - Sets or clears that part
 */
interface PhotosFieldProps {
  dataset: DatasetSnapshot;
  visit: PhotoVisit;
  photoPath?: string;
  onChange: (photoPath: string | undefined) => void;
  photoRange?: PhotoRange;
  onRangeChange: (photoRange: PhotoRange | undefined) => void;
}

/**
 * PhotosField component
 * Links a visit to its gallery: pick an existing one, upload photos and videos
 * straight into it, or import a manifest made elsewhere. When two visits share
 * one gallery, the first and last photo numbers say which part is this one's.
 * Used for stays and for places seen on a day trip or along a journey, which
 * is why it takes a visit rather than a step.
 * @component
 * @param {PhotosFieldProps} props - The field props
 * @param {DatasetSnapshot} props.dataset - The current dataset
 * @param {PhotoVisit} props.visit - The visit the photos belong to
 * @param {string} [props.photoPath] - The linked gallery, when there is one
 * @param {(photoPath: string | undefined) => void} props.onChange - Links or unlinks a gallery
 * @param {PhotoRange} [props.photoRange] - The part of the gallery this visit owns
 * @param {(photoRange: PhotoRange | undefined) => void} props.onRangeChange - Sets or clears that part
 * @returns {ReactNode} The photos field
 */
export function PhotosField({
  dataset,
  visit,
  photoPath,
  onChange,
  photoRange,
  onRangeChange,
}: PhotosFieldProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [isImporting, setIsImporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const canAttach = canImportForVisit(dataset, visit);

  /**
   * Updates one end of the range, dropping the range once both ends are empty.
   * @param {PhotoRange} next - The range with the changed end
   * @returns {void}
   */
  const changeRange = (next: PhotoRange): void =>
    onRangeChange(next.from || next.to ? next : undefined);

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
      <Button
        className="photos-field__action"
        disabled={!canAttach}
        onClick={() => setIsUploading(true)}
        variant="primary"
      >
        <Upload aria-hidden="true" />
        {t("upload.open")}
      </Button>
      <Button
        className="photos-field__action"
        disabled={!canAttach}
        onClick={() => setIsImporting(true)}
        title={t("photoImport.title")}
      >
        <Images aria-hidden="true" />
        {t("photoImport.open")}
      </Button>
      {photoPath ? (
        <div className="photos-field__range">
          <NumberField
            label={t("stepFields.photoFrom")}
            min={1}
            onChange={(from) => changeRange({ ...photoRange, from })}
            step="1"
            value={photoRange?.from}
          />
          <NumberField
            hint={t("stepFields.photoRangeHint")}
            label={t("stepFields.photoTo")}
            min={1}
            onChange={(to) => changeRange({ ...photoRange, to })}
            step="1"
            value={photoRange?.to}
          />
        </div>
      ) : null}
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
