import { CityJson } from "@travelmap/core";
import { ReactNode, useState } from "react";

import {
  cityPath,
  countries,
  DataFile,
  deleteData,
  reloadAt,
  trips,
  writeData,
} from "../../../dataset";
import { CoordinatePicker } from "../../CoordinatePicker/CoordinatePicker";
import { EditorForm } from "../../EditorForm/EditorForm";
import {
  CheckboxField,
  NumberField,
  SelectField,
  StringListField,
  TextField,
} from "../../Fields/Fields";
import { LocalizedNames } from "../../LocalizedNames/LocalizedNames";

const TIMEZONE_LIST_ID = "editor-timezones";

/**
 * CityScreen component
 * Edits one city document. Moving a city to another country also moves its
 * file, because the country id is part of the dataset path.
 * @component
 * @param {CityScreenProps} props
 * @param {DataFile<CityJson>} props.file - City source file
 * @param {boolean} props.isDarkTheme - Whether the dark map theme is active
 * @returns {ReactNode} The city editor screen
 */
export function CityScreen({ file, isDarkTheme }: CityScreenProps): ReactNode {
  const [value, setValue] = useState(file.value);
  const isDirty = JSON.stringify(value) !== JSON.stringify(file.value);
  const dependents = trips.filter(({ value: trip }) =>
    trip.steps.some((step) =>
      step.type === "stop"
        ? step.cityId === file.value.id
        : step.fromId === file.value.id ||
          step.toId === file.value.id ||
          (step.viaIds ?? []).includes(file.value.id),
    ),
  );
  const problems = [
    ...(value.name.trim() ? [] : ["A canonical name is required."]),
    ...(value.timeZone.trim() ? [] : ["A timezone is required."]),
  ];

  /**
   * Saves the city, relocating its file when the owning country changed.
   * @returns {Promise<void>} Completion after the write
   */
  async function handleSave(): Promise<void> {
    const path = cityPath(value.countryId, value.id);
    await writeData(path, value);
    if (path !== file.path) {
      await deleteData(file.path);
      reloadAt(`/cities/${value.id}`);
    }
  }

  /**
   * Removes the city document and returns to the overview.
   * @returns {Promise<void>} Completion after the delete
   */
  async function handleDelete(): Promise<void> {
    await deleteData(file.path);
    reloadAt("/");
  }
  return (
    <EditorForm
      eyebrow="City"
      isDirty={isDirty}
      onDelete={dependents.length === 0 ? handleDelete : undefined}
      onSave={handleSave}
      path={file.path}
      problems={problems}
      title={file.value.name}
    >
      <LocalizedNames
        canonicalHint="Shown on cards and map labels. The gallery URL uses the id instead, so renaming is safe."
        label="Names"
        onChange={(names) => setValue({ ...value, ...names })}
        value={value}
      />
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Position</h2>
        <CoordinatePicker
          isDarkTheme={isDarkTheme}
          onChange={(coordinates) => setValue({ ...value, coordinates })}
          value={value.coordinates}
        />
        <p className="editor-panel__hint">
          Click the map or drag the marker to set a position.
        </p>
        <div className="editor-panel__row">
          <NumberField
            label="Longitude"
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
            label="Latitude"
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
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Details</h2>
        <div className="editor-panel__row">
          <SelectField
            label="Country"
            onChange={(countryId) => setValue({ ...value, countryId })}
            options={countries.map(({ value: country }) => ({
              label: country.name,
              value: country.id,
            }))}
            value={value.countryId}
          />
          <TextField
            label="Timezone"
            list={TIMEZONE_LIST_ID}
            onChange={(timeZone) => setValue({ ...value, timeZone })}
            value={value.timeZone}
          />
        </div>
        <datalist id={TIMEZONE_LIST_ID}>
          {Intl.supportedValuesOf("timeZone").map((timeZone) => (
            <option key={timeZone} value={timeZone} />
          ))}
        </datalist>
        <div className="editor-panel__row">
          <NumberField
            label="Population"
            min={0}
            onChange={(population) => setValue({ ...value, population })}
            value={value.population}
          />
          <NumberField
            label="Minimum marker scale"
            min={0}
            onChange={(minMarkerScale) =>
              setValue({ ...value, minMarkerScale })
            }
            step="any"
            value={value.minMarkerScale}
          />
          <CheckboxField
            label="Former home"
            onChange={(isLived) => setValue({ ...value, isLived })}
            value={value.isLived}
          />
        </div>
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Background images</h2>
        <StringListField
          hint="One CDN-relative path per line, cycled through on repeat visits."
          label="Paths"
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
            {dependents.length === 1
              ? "1 trip references"
              : `${dependents.length} trips reference`}{" "}
            this city, so it cannot be deleted yet.
          </p>
        ) : null}
      </section>
    </EditorForm>
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
