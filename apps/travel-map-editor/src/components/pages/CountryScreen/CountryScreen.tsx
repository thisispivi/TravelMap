import "./CountryScreen.scss";

import { CountryJson } from "@travelmap/core";
import { ReactNode, useState } from "react";

import {
  cities,
  countryPath,
  DataFile,
  deleteData,
  locales,
  reloadAt,
  writeData,
} from "../../../dataset";
import { findWorldCountry, translationsForLocales } from "../../../world";
import { ColorField } from "../../ColorField/ColorField";
import { EditorForm } from "../../EditorForm/EditorForm";
import { NumberField } from "../../Fields/Fields";

/**
 * CountryScreen component
 * Edits one country. Its name, translations, continent, and currency come from
 * world data rather than being typed, so the only real decision is the colour
 * it takes on the map.
 * @component
 * @param {CountryScreenProps} props
 * @param {DataFile<CountryJson>} props.file - Country source file
 * @returns {ReactNode} The country editor screen
 */
export function CountryScreen({ file }: CountryScreenProps): ReactNode {
  const [value, setValue] = useState(file.value);
  const isDirty = JSON.stringify(value) !== JSON.stringify(file.value);
  const world = findWorldCountry(file.value.id);
  const dependents = cities.filter(
    (city) => city.value.countryId === file.value.id,
  );
  const problems = value.name.trim() ? [] : ["A canonical name is required."];
  const configuredLocales = locales();
  const worldNames = world
    ? {
        name: world.name,
        nameByLocale: translationsForLocales(world, configuredLocales),
      }
    : undefined;
  const isStale =
    world !== undefined &&
    worldNames !== undefined &&
    (worldNames.name !== value.name ||
      JSON.stringify(worldNames.nameByLocale ?? {}) !==
        JSON.stringify(value.nameByLocale ?? {}) ||
      world.continent !== value.continent ||
      world.currency !== value.currency);

  /**
   * Restores every derived field from the world catalogue.
   * @returns {void}
   */
  function refreshFromWorld(): void {
    if (!world || !worldNames) return;
    setValue({
      ...value,
      continent: world.continent,
      currency: world.currency,
      name: worldNames.name,
      nameByLocale: worldNames.nameByLocale,
    });
  }

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
      titleIconUrl={world?.flagUrl}
    >
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Identity</h2>
        {world ? (
          <>
            <dl className="country-screen__facts">
              <div className="country-screen__fact">
                <dt>Name</dt>
                <dd>{value.name}</dd>
              </div>
              <div className="country-screen__fact">
                <dt>Continent</dt>
                <dd>{value.continent.replace("_", " ").toLowerCase()}</dd>
              </div>
              <div className="country-screen__fact">
                <dt>Currency</dt>
                <dd>{value.currency}</dd>
              </div>
              <div className="country-screen__fact">
                <dt>Map id</dt>
                <dd>
                  <code>{value.id}</code>
                </dd>
              </div>
            </dl>
            {configuredLocales.length > 0 ? (
              <dl className="country-screen__facts">
                {configuredLocales.map((locale) => (
                  <div className="country-screen__fact" key={locale}>
                    <dt>{locale}</dt>
                    <dd>{value.nameByLocale?.[locale] ?? value.name}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <p className="editor-panel__hint">
              Taken from world data — nothing here needs typing.
            </p>
            {isStale ? (
              <div className="country-screen__actions">
                <button
                  className="editor-button editor-button--primary"
                  onClick={refreshFromWorld}
                  type="button"
                >
                  Restore from world data
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <p className="editor-notice editor-notice--warning">
            <span className="editor-notice__item">
              <code>{value.id}</code> is not in the world map data, so it will
              not be filled in on the map and its details cannot be refreshed
              automatically.
            </span>
          </p>
        )}
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Map colour</h2>
        <p className="editor-panel__hint">
          Fills the country on the map once you have visited it.
        </p>
        <ColorField
          label="Fill"
          onChange={(color) => setValue({ ...value, color })}
          value={value.color}
        />
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Marker scale</h2>
        <p className="editor-panel__hint">
          Optional bounds on how large this country&apos;s city markers grow.
        </p>
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
