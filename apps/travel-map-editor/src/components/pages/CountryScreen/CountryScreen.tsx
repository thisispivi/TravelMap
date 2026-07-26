import "./CountryScreen.scss";

import { CountryJson } from "@travelmap/core";
import { ReactNode, useState } from "react";

import {
  cities,
  continents,
  countryPath,
  currencies,
  DataFile,
  deleteData,
  reloadAt,
  writeData,
} from "../../../dataset";
import { EditorForm } from "../../EditorForm/EditorForm";
import { NumberField, SelectField } from "../../Fields/Fields";
import { LocalizedNames } from "../../LocalizedNames/LocalizedNames";

/**
 * CountryScreen component
 * Edits one country document, including the HSL colour the map derives its
 * fill from.
 * @component
 * @param {CountryScreenProps} props
 * @param {DataFile<CountryJson>} props.file - Country source file
 * @returns {ReactNode} The country editor screen
 */
export function CountryScreen({ file }: CountryScreenProps): ReactNode {
  const [value, setValue] = useState(file.value);
  const isDirty = JSON.stringify(value) !== JSON.stringify(file.value);
  const dependents = cities.filter(
    (city) => city.value.countryId === file.value.id,
  );
  const problems = value.name.trim() ? [] : ["A canonical name is required."];

  /**
   * Removes the country document and returns to the overview.
   * @returns {Promise<void>} Completion after the delete
   */
  async function handleDelete(): Promise<void> {
    await deleteData(file.path);
    reloadAt("/");
  }
  return (
    <EditorForm
      eyebrow="Country"
      isDirty={isDirty}
      onDelete={dependents.length === 0 ? handleDelete : undefined}
      onSave={() => writeData(countryPath(value.id), value)}
      path={file.path}
      problems={problems}
      title={file.value.name}
    >
      <LocalizedNames
        canonicalHint="Must match the country name in the world map data, or the country will not be filled in."
        label="Names"
        onChange={(names) => setValue({ ...value, ...names })}
        value={value}
      />
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Classification</h2>
        <div className="editor-panel__row">
          <SelectField
            label="Continent"
            onChange={(continent) =>
              setValue({
                ...value,
                continent: continent as CountryJson["continent"],
              })
            }
            options={continents.map((continent) => ({
              label: continent,
              value: continent,
            }))}
            value={value.continent}
          />
          <SelectField
            label="Currency"
            onChange={(currency) =>
              setValue({
                ...value,
                currency: currency as CountryJson["currency"],
              })
            }
            options={currencies.map((currency) => ({
              label: currency,
              value: currency,
            }))}
            value={value.currency}
          />
        </div>
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Map colour</h2>
        <div
          className="country-screen__swatch"
          style={{
            background: `hsl(${value.color.h} ${value.color.s}% ${value.color.l}%)`,
          }}
        />
        <div className="editor-panel__row">
          <NumberField
            label="Hue"
            min={0}
            onChange={(h) =>
              setValue({ ...value, color: { ...value.color, h: h ?? 0 } })
            }
            value={value.color.h}
          />
          <NumberField
            label="Saturation"
            min={0}
            onChange={(s) =>
              setValue({ ...value, color: { ...value.color, s: s ?? 0 } })
            }
            value={value.color.s}
          />
          <NumberField
            label="Lightness"
            min={0}
            onChange={(l) =>
              setValue({ ...value, color: { ...value.color, l: l ?? 0 } })
            }
            value={value.color.l}
          />
        </div>
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Marker scale</h2>
        <div className="editor-panel__row">
          <NumberField
            label="Minimum"
            min={0}
            onChange={(minMarkerScale) =>
              setValue({ ...value, minMarkerScale })
            }
            step="any"
            value={value.minMarkerScale}
          />
          <NumberField
            label="Maximum"
            min={0}
            onChange={(maxMarkerScale) =>
              setValue({ ...value, maxMarkerScale })
            }
            step="any"
            value={value.maxMarkerScale}
          />
        </div>
        {dependents.length > 0 ? (
          <p className="editor-panel__hint">
            {dependents.length === 1
              ? "1 city belongs"
              : `${dependents.length} cities belong`}{" "}
            to this country, so it cannot be deleted yet.
          </p>
        ) : null}
      </section>
    </EditorForm>
  );
}

/**
 * Props for CountryScreen.
 * @property {DataFile<CountryJson>} file - Country source file
 */
interface CountryScreenProps {
  file: DataFile<CountryJson>;
}
