import { useLanguage } from "@app/shared/hooks/useLanguage";
import { CityJson } from "@travelmap/core";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router";

import { cityPath } from "../../../../data/paths";
import { DataFile, deleteDocument, moveDocument } from "../../../../data/store";
import { Combobox } from "../../../../shared/components/Combobox/Combobox";
import { DocumentScreen } from "../../../../shared/components/DocumentScreen/DocumentScreen";
import {
  CheckboxField,
  NumberField,
  StringListField,
} from "../../../../shared/components/Fields/Fields";
import { LocalizedNames } from "../../../../shared/components/LocalizedNames/LocalizedNames";
import { useDataset } from "../../../../shared/hooks/useDataset";
import { findWorldCountry } from "../../../../shared/lib/worldCountries";
import { snapshotBeforeChange } from "../../../backup/lib/snapshots";
import { CoordinatePicker } from "../../../map/components/CoordinatePicker/CoordinatePicker";
import { countryOptions, timeZoneOptions } from "../../lib/placeOptions";
import { PlaceImport } from "../PlaceImport/PlaceImport";

/**
 * CityScreen component
 * Edits one city. Moving a city to another country also moves its file,
 * because the country id is part of the dataset path.
 * @component
 * @param {CityScreenProps} props
 * @param {DataFile<CityJson>} props.file - City source file
 * @param {boolean} props.isDarkTheme - Whether the dark map theme is active
 * @returns {ReactNode} The city editor screen
 */
export function CityScreen({ file, isDarkTheme }: CityScreenProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const dataset = useDataset();
  const navigate = useNavigate();
  const [value, setValue] = useState(file.value);
  const isDirty = JSON.stringify(value) !== JSON.stringify(file.value);
  const dependents = dataset.trips.filter(({ value: trip }) =>
    trip.steps.some((step) =>
      step.type === "stop"
        ? step.cityId === file.value.id
        : step.fromId === file.value.id ||
          step.toId === file.value.id ||
          (step.viaIds ?? []).includes(file.value.id),
    ),
  );
  const problems = [
    ...(value.name.trim() ? [] : [t("cityScreen.nameRequired")]),
    ...(value.timeZone.trim() ? [] : [t("cityScreen.timezoneRequired")]),
  ];

  /**
   * Saves the city, relocating its file when the owning country changed.
   * @returns {Promise<void>} Completion after the write
   */
  async function handleSave(): Promise<void> {
    await moveDocument(file.path, cityPath(value.countryId, value.id), value);
  }

  /**
   * Removes the city document and returns to the library.
   * @returns {Promise<void>} Completion after the delete
   */
  async function handleDelete(): Promise<void> {
    await snapshotBeforeChange(`before deleting ${file.path}`);
    await deleteDocument(file.path);
    await navigate("/");
  }
  return (
    <DocumentScreen
      eyebrow={t("cityScreen.eyebrow")}
      isDirty={isDirty}
      onDelete={dependents.length === 0 ? handleDelete : undefined}
      onSave={handleSave}
      path={file.path}
      problems={problems}
      title={file.value.name}
      titleIconUrl={findWorldCountry(value.countryId)?.flagUrl}
      value={value}
    >
      <section className="editor-panel">
        <h2 className="editor-panel__legend">{t("cityScreen.position")}</h2>
        <PlaceImport
          onImport={(place) =>
            setValue((current) => ({
              ...current,
              coordinates: place.coordinates,
            }))
          }
        />
        <CoordinatePicker
          isDarkTheme={isDarkTheme}
          onChange={(coordinates) => setValue({ ...value, coordinates })}
          value={value.coordinates}
        />
        <div className="editor-panel__row">
          <NumberField
            label={t("cityScreen.longitude")}
            onChange={(longitude) =>
              setValue({
                ...value,
                coordinates: [longitude ?? 0, value.coordinates[1]],
              })
            }
            step="any"
            value={value.coordinates[0]}
          />
          <NumberField
            label={t("cityScreen.latitude")}
            onChange={(latitude) =>
              setValue({
                ...value,
                coordinates: [value.coordinates[0], latitude ?? 0],
              })
            }
            step="any"
            value={value.coordinates[1]}
          />
        </div>
      </section>
      <LocalizedNames
        canonicalHint={t("cityScreen.namesHint")}
        label={t("cityScreen.names")}
        onChange={(names) => setValue({ ...value, ...names })}
        value={value}
      />
      <section className="editor-panel">
        <h2 className="editor-panel__legend">{t("cityScreen.details")}</h2>
        <div className="editor-panel__row">
          <Combobox
            label={t("cityScreen.country")}
            onChange={(countryId) => setValue({ ...value, countryId })}
            options={countryOptions(dataset)}
            value={value.countryId}
          />
          <Combobox
            hint={t("cityScreen.timezoneHint")}
            label={t("cityScreen.timezone")}
            onChange={(timeZone) => setValue({ ...value, timeZone })}
            options={timeZoneOptions()}
            value={value.timeZone}
          />
        </div>
        <div className="editor-panel__row">
          <NumberField
            hint={t("cityScreen.populationHint")}
            label={t("cityScreen.population")}
            min={0}
            onChange={(population) => setValue({ ...value, population })}
            value={value.population}
          />
          <NumberField
            label={t("cityScreen.minMarkerScale")}
            min={0}
            onChange={(minMarkerScale) =>
              setValue({ ...value, minMarkerScale })
            }
            step="any"
            value={value.minMarkerScale}
          />
          <CheckboxField
            label={t("cityScreen.formerHome")}
            onChange={(isLived) => setValue({ ...value, isLived })}
            value={value.isLived}
          />
        </div>
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          {t("cityScreen.backgroundImages")}
        </h2>
        <StringListField
          hint={t("cityScreen.pathsHint")}
          label={t("cityScreen.paths")}
          onChange={(backgroundImages) =>
            setValue({
              ...value,
              backgroundImages:
                backgroundImages.length > 0 ? backgroundImages : undefined,
            })
          }
          value={value.backgroundImages}
        />
        {dependents.length > 0 ? (
          <p className="editor-panel__hint">
            {t("cityScreen.cannotDelete", { count: dependents.length })}
          </p>
        ) : null}
      </section>
    </DocumentScreen>
  );
}

/**
 * Props for CityScreen.
 * @property {DataFile<CityJson>} file - City source file
 * @property {boolean} isDarkTheme - Whether the dark map theme is active
 */
interface CityScreenProps {
  file: DataFile<CityJson>;
  isDarkTheme: boolean;
}
