import "./SettingsScreen.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { Plus, Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";

import { resolveMapSettings, SiteConfig } from "../../../../data/siteConfig";
import { DataFile, saveDocument } from "../../../../data/store";
import {
  Combobox,
  MultiCombobox,
} from "../../../../shared/components/Combobox/Combobox";
import { DocumentScreen } from "../../../../shared/components/DocumentScreen/DocumentScreen";
import {
  NumberField,
  StringListField,
  TextField,
} from "../../../../shared/components/Fields/Fields";
import { useDataset } from "../../../../shared/hooks/useDataset";
import { findWorldCountry } from "../../../../shared/lib/worldCountries";
import { BackupPanel } from "../../../backup/components/BackupPanel/BackupPanel";

const MAP_ZOOM_FIELDS = [
  ["defaultZoom", "configScreen.defaultZoom"],
  ["defaultMinZoom", "configScreen.minimumZoom"],
  ["defaultMaxZoom", "configScreen.maximumZoom"],
  ["hoveredCityZoom", "configScreen.hoveredCityZoom"],
] as const;

const SITE_FIELDS = [
  ["name", "configScreen.siteName", "configScreen.siteNamePlaceholder"],
  ["domain", "configScreen.domain", "configScreen.domainPlaceholder"],
  [
    "description",
    "configScreen.description",
    "configScreen.descriptionPlaceholder",
  ],
  ["author", "configScreen.author", "configScreen.authorPlaceholder"],
] as const;

/**
 * SettingsScreen component
 * Edits everything a fork owns outside the travel data itself: identity,
 * locales, city roles, map defaults, backups, and UNESCO counts.
 * @component
 * @param {SettingsScreenProps} props
 * @param {DataFile<SiteConfig>} props.file - Site configuration source file
 * @returns {ReactNode} The site settings screen
 */
export function SettingsScreen({ file }: SettingsScreenProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [value, setValue] = useState(file.value);
  const [newLocale, setNewLocale] = useState("");
  const dataset = useDataset();
  const isDirty = JSON.stringify(value) !== JSON.stringify(file.value);
  const site = value.site ?? {};
  const map = resolveMapSettings(value.map);
  const locales = value.locales ?? [];
  const cityOptions = dataset.cities.map(({ value: city }) => ({
    hint: city.countryId,
    iconUrl: findWorldCountry(city.countryId)?.flagUrl,
    label: city.name,
    value: city.id,
  }));

  /**
   * Adds a locale tag used for translated names across the dataset.
   * @returns {void}
   */
  function addLocale(): void {
    const locale = newLocale.trim();
    if (!locale || locales.includes(locale)) return;
    setValue((current) => ({
      ...current,
      locales: [...(current.locales ?? []), locale],
    }));
    setNewLocale("");
  }
  return (
    <DocumentScreen
      isDirty={isDirty}
      kind={t("configScreen.kind")}
      onSave={() => saveDocument(file.path, value)}
      path={file.path}
      savedMessage={t("toast.settingsSaved")}
      title={t("configScreen.title")}
      value={value}
    >
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          {t("configScreen.siteMetadata")}
        </h2>
        <div className="editor-panel__row">
          {SITE_FIELDS.map(([key, labelKey, placeholder]) => (
            <TextField
              key={key}
              label={t(labelKey)}
              onChange={(next) =>
                setValue((current) => ({
                  ...current,
                  site: { ...(current.site ?? {}), [key]: next },
                }))
              }
              placeholder={t(placeholder)}
              value={site[key] ?? ""}
            />
          ))}
        </div>
        <TextField
          hint={t("configScreen.commaSeparated")}
          label={t("configScreen.keywords")}
          onChange={(keywords) =>
            setValue({
              ...value,
              site: {
                ...site,
                keywords: keywords
                  .split(",")
                  .map((keyword) => keyword.trim())
                  .filter(Boolean),
              },
            })
          }
          value={site.keywords?.join(", ") ?? ""}
        />
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">{t("configScreen.locales")}</h2>
        <p className="editor-panel__hint">{t("configScreen.localesHint")}</p>
        {locales.length > 0 ? (
          <ul className="settings-screen__tags">
            {locales.map((locale) => (
              <li className="settings-screen__tag" key={locale}>
                <code>{locale}</code>
                <button
                  aria-label={t("configScreen.removeLocale", { locale })}
                  className="settings-screen__tag-remove"
                  onClick={() =>
                    setValue({
                      ...value,
                      locales: locales.filter((entry) => entry !== locale),
                    })
                  }
                  type="button"
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="settings-screen__add">
          <TextField
            label={t("configScreen.addLocale")}
            onChange={setNewLocale}
            placeholder="it-IT"
            value={newLocale}
          />
          <button className="editor-button" onClick={addLocale} type="button">
            <Plus aria-hidden="true" />
            {t("configScreen.add")}
          </button>
        </div>
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">{t("configScreen.cityRoles")}</h2>
        <Combobox
          emptyLabel={t("configScreen.none")}
          label={t("configScreen.homeCity")}
          onChange={(homeCityId) =>
            setValue({ ...value, homeCityId: homeCityId || null })
          }
          options={cityOptions}
          value={value.homeCityId ?? ""}
        />
        <div className="editor-panel__row">
          <MultiCombobox
            label={t("configScreen.formerHomes")}
            onChange={(livedCityIds) => setValue({ ...value, livedCityIds })}
            options={cityOptions}
            value={value.livedCityIds ?? []}
          />
          <MultiCombobox
            label={t("configScreen.futureCities")}
            onChange={(futureCityIds) => setValue({ ...value, futureCityIds })}
            options={cityOptions}
            value={value.futureCityIds ?? []}
          />
        </div>
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          {t("configScreen.mapDefaults")}
        </h2>
        <div className="editor-panel__row">
          <NumberField
            label={t("cityScreen.longitude")}
            onChange={(longitude) =>
              setValue({
                ...value,
                map: {
                  ...map,
                  defaultCenter: [longitude ?? 0, map.defaultCenter[1]],
                },
              })
            }
            step="any"
            value={map.defaultCenter[0]}
          />
          <NumberField
            label={t("cityScreen.latitude")}
            onChange={(latitude) =>
              setValue({
                ...value,
                map: {
                  ...map,
                  defaultCenter: [map.defaultCenter[0], latitude ?? 0],
                },
              })
            }
            step="any"
            value={map.defaultCenter[1]}
          />
        </div>
        <div className="editor-panel__row">
          {MAP_ZOOM_FIELDS.map(([key, labelKey]) => (
            <NumberField
              key={key}
              label={t(labelKey)}
              onChange={(next) =>
                setValue({ ...value, map: { ...map, [key]: next ?? 0 } })
              }
              step="any"
              value={map[key]}
            />
          ))}
        </div>
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          {t("configScreen.tripDisplay")}
        </h2>
        <NumberField
          label={t("configScreen.groupByCitiesCutoffYear")}
          onChange={(groupByCitiesCutoffYear) =>
            setValue({
              ...value,
              trips: {
                groupByCitiesCutoffYear:
                  groupByCitiesCutoffYear ?? new Date().getFullYear(),
              },
            })
          }
          value={value.trips?.groupByCitiesCutoffYear}
        />
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">{t("configScreen.mediaPaths")}</h2>
        <TextField
          hint={t("configScreen.mediaRootHint")}
          label={t("configScreen.mediaRoot")}
          onChange={(root) =>
            setValue({ ...value, media: { root: root || "/Travels" } })
          }
          placeholder="/Travels"
          value={value.media?.root ?? "/Travels"}
        />
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          {t("configScreen.unescoSites")}
        </h2>
        <p className="editor-panel__hint">
          {t("configScreen.unescoSitesHint")}
        </p>
        {dataset.countries.map(({ value: country }) => (
          <StringListField
            key={country.id}
            label={country.name}
            onChange={(sites) =>
              setValue((current) => {
                const unescoSites = { ...(current.unescoSites ?? {}) };
                if (sites.length > 0) unescoSites[country.name] = sites;
                else delete unescoSites[country.name];
                return { ...current, unescoSites };
              })
            }
            value={value.unescoSites?.[country.name]}
          />
        ))}
      </section>
      <BackupPanel />
    </DocumentScreen>
  );
}

/**
 * Props for SettingsScreen.
 * @property {DataFile<SiteConfig>} file - Site configuration source file
 */
interface SettingsScreenProps {
  file: DataFile<SiteConfig>;
}
