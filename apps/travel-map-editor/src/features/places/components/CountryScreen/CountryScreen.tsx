import "./CountryScreen.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { CountryJson } from "@travelmap/core";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router";

import { locales } from "../../../../data/dataset";
import { countryPath } from "../../../../data/paths";
import { DataFile, deleteDocument, saveDocument } from "../../../../data/store";
import { ColorField } from "../../../../shared/components/ColorField/ColorField";
import { DocumentScreen } from "../../../../shared/components/DocumentScreen/DocumentScreen";
import { NumberField } from "../../../../shared/components/Fields/Fields";
import { useDataset } from "../../../../shared/hooks/useDataset";
import {
  findWorldCountry,
  translationsForLocales,
} from "../../../../shared/lib/worldCountries";
import { snapshotBeforeChange } from "../../../backup/lib/snapshots";

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
  const { t } = useLanguage(["editor"]);
  const dataset = useDataset();
  const navigate = useNavigate();
  const [value, setValue] = useState(file.value);
  const isDirty = JSON.stringify(value) !== JSON.stringify(file.value);
  const world = findWorldCountry(file.value.id);
  const dependents = dataset.cities.filter(
    (city) => city.value.countryId === file.value.id,
  );
  const problems = value.name.trim() ? [] : [t("countryScreen.nameRequired")];
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
   * Removes the country document and returns to the library.
   * @returns {Promise<void>} Completion after the delete
   */
  async function handleDelete(): Promise<void> {
    await snapshotBeforeChange(`before deleting ${file.path}`);
    await deleteDocument(file.path);
    await navigate("/");
  }
  return (
    <DocumentScreen
      eyebrow={t("countryScreen.eyebrow")}
      isDirty={isDirty}
      onDelete={dependents.length === 0 ? handleDelete : undefined}
      onSave={() => saveDocument(countryPath(value.id), value)}
      path={file.path}
      problems={problems}
      title={file.value.name}
      titleIconUrl={world?.flagUrl}
      value={value}
    >
      <section className="editor-panel">
        <h2 className="editor-panel__legend">{t("countryScreen.identity")}</h2>
        {world ? (
          <>
            <dl className="country-screen__facts">
              <div className="country-screen__fact">
                <dt>{t("countryScreen.name")}</dt>
                <dd>{value.name}</dd>
              </div>
              <div className="country-screen__fact">
                <dt>{t("countryScreen.continent")}</dt>
                <dd>{value.continent.replace("_", " ").toLowerCase()}</dd>
              </div>
              <div className="country-screen__fact">
                <dt>{t("countryScreen.currency")}</dt>
                <dd>{value.currency}</dd>
              </div>
              <div className="country-screen__fact">
                <dt>{t("countryScreen.mapId")}</dt>
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
              {t("countryScreen.fromWorldDataHint")}
            </p>
            {isStale ? (
              <div className="country-screen__actions">
                <button
                  className="editor-button editor-button--primary"
                  onClick={refreshFromWorld}
                  type="button"
                >
                  {t("countryScreen.restoreFromWorldData")}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <p className="editor-notice editor-notice--warning">
            <span className="editor-notice__item">
              <code>{value.id}</code> {t("countryScreen.notInWorldData")}
            </span>
          </p>
        )}
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">{t("countryScreen.mapColour")}</h2>
        <p className="editor-panel__hint">{t("countryScreen.mapColourHint")}</p>
        <ColorField
          label={t("countryScreen.fill")}
          onChange={(color) => setValue({ ...value, color })}
          value={value.color}
        />
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          {t("countryScreen.markerScale")}
        </h2>
        <p className="editor-panel__hint">
          {t("countryScreen.markerScaleHint")}
        </p>
        <div className="editor-panel__row">
          <NumberField
            label={t("countryScreen.minimum")}
            min={0}
            onChange={(minMarkerScale) =>
              setValue({ ...value, minMarkerScale })
            }
            step="any"
            value={value.minMarkerScale}
          />
          <NumberField
            label={t("countryScreen.maximum")}
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
            {t("countryScreen.cannotDelete", { count: dependents.length })}
          </p>
        ) : null}
      </section>
    </DocumentScreen>
  );
}

/**
 * Props for CountryScreen.
 * @property {DataFile<CountryJson>} file - Country source file
 */
interface CountryScreenProps {
  file: DataFile<CountryJson>;
}
