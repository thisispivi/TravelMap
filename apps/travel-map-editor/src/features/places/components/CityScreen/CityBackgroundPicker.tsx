import "./CityBackgroundPicker.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { Image } from "@travelmap/core";
import { ReactNode } from "react";

import { resolveMediaUrl } from "../../../../data/dataset";
import { DatasetSnapshot } from "../../../../data/store";

/**
 * A gallery photo that can become a city card background.
 * @property {string} original - Full-size path stored as the background
 * @property {string} thumbnail - Thumbnail path used by the picker
 */
interface BackgroundPhoto {
  original: string;
  thumbnail: string;
}

/**
 * Removes the dataset wrapper from a photo manifest path.
 * @param {string} path - Dataset-relative manifest path
 * @returns {string} The photoPath used by trip stops
 */
function photoKey(path: string): string {
  return path.replace(/^photos\//, "").replace(/\.json$/, "");
}

/**
 * Lists unique, non-video photos attached to stays in one city.
 * @param {DatasetSnapshot} dataset - Current editor dataset
 * @param {string} cityId - City whose galleries should be searched
 * @returns {BackgroundPhoto[]} Candidate full-size and thumbnail paths
 */
function cityBackgroundPhotos(
  dataset: DatasetSnapshot,
  cityId: string,
): BackgroundPhoto[] {
  const linkedPhotoKeys = new Set(
    dataset.trips.flatMap(({ value: trip }) =>
      trip.steps.flatMap((step) =>
        step.type === "stop" && step.cityId === cityId && step.photoPath
          ? [step.photoPath]
          : [],
      ),
    ),
  );
  const candidates = dataset.photos.flatMap(({ path, value }) =>
    linkedPhotoKeys.has(photoKey(path)) ? value : [],
  );
  const uniquePhotos = new Map<string, Image>();

  for (const photo of candidates) {
    if (!photo.youtube && !uniquePhotos.has(photo.original)) {
      uniquePhotos.set(photo.original, photo);
    }
  }

  return Array.from(uniquePhotos.values(), ({ original, thumbnail }) => ({
    original,
    thumbnail,
  }));
}

/**
 * CityBackgroundPicker component
 * Lets an author promote a photo from any gallery attached to the city. The
 * selected photo is moved to the first background position because index zero
 * is the image used by the public Places tab.
 * @component
 * @param {CityBackgroundPickerProps} props
 * @param {string} props.cityId - City whose gallery photos are available
 * @param {DatasetSnapshot} props.dataset - Current editor dataset
 * @param {(value: string[]) => void} props.onChange - Background order callback
 * @param {string[]} [props.value] - Current background image order
 * @returns {ReactNode} The city photo picker
 */
export function CityBackgroundPicker({
  cityId,
  dataset,
  onChange,
  value = [],
}: CityBackgroundPickerProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const photos = cityBackgroundPhotos(dataset, cityId);
  const selectedPath = value[0];

  return (
    <div className="city-background-picker">
      <div className="city-background-picker__heading">
        <h3>{t("cityScreen.chooseFromPhotos")}</h3>
        <p>{t("cityScreen.chooseFromPhotosHint")}</p>
      </div>
      {photos.length > 0 ? (
        <div className="city-background-picker__grid">
          {photos.map((photo, index) => {
            const isSelected = photo.original === selectedPath;
            return (
              <button
                aria-label={t("cityScreen.usePhoto", {
                  position: index + 1,
                })}
                aria-pressed={isSelected}
                className="city-background-picker__option"
                key={photo.original}
                onClick={() =>
                  onChange([
                    photo.original,
                    ...value.filter((path) => path !== photo.original),
                  ])
                }
                type="button"
              >
                <img
                  alt=""
                  className="city-background-picker__image"
                  loading="lazy"
                  src={resolveMediaUrl(photo.thumbnail)}
                />
                {isSelected ? (
                  <span className="city-background-picker__badge">
                    {t("cityScreen.placesBackground")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="editor-panel__hint">{t("cityScreen.noTripPhotos")}</p>
      )}
    </div>
  );
}

/**
 * Props for CityBackgroundPicker.
 * @property {string} cityId - City whose gallery photos are available
 * @property {DatasetSnapshot} dataset - Current editor dataset
 * @property {(value: string[]) => void} onChange - Background order callback
 * @property {string[]} [value] - Current background image order
 */
interface CityBackgroundPickerProps {
  cityId: string;
  dataset: DatasetSnapshot;
  onChange: (value: string[]) => void;
  value?: string[];
}
