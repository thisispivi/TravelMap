import "./ConfigScreen.scss";

import { useLanguage } from "@app/hooks/language/language";
import { ReactNode, useState } from "react";

import {
  cities,
  Company,
  config,
  countries,
  DataFile,
  idError,
  resolveLogoUrl,
  SiteConfig,
  writeData,
} from "../../../core/dataset";
import { findWorldCountry } from "../../../core/world";
import {
  NumberField,
  StringListField,
  TextField,
} from "../../atoms/Fields/Fields";
import { ImageUploadField } from "../../atoms/ImageUploadField/ImageUploadField";
import { Combobox, MultiCombobox } from "../../molecules/Combobox/Combobox";
import { EditorForm } from "../../organisms/EditorForm/EditorForm";

const MAP_ZOOM_FIELDS = [
  ["defaultZoom", "configScreen.defaultZoom"],
  ["defaultMinZoom", "configScreen.minimumZoom"],
  ["defaultMaxZoom", "configScreen.maximumZoom"],
  ["hoveredCityZoom", "configScreen.hoveredCityZoom"],
] as const;

const SITE_FIELDS = [
  ["name", "configScreen.siteName", "My Travels"],
  ["domain", "configScreen.domain", "map.example.com"],
  ["description", "configScreen.description", "A personal map of travels."],
  ["author", "configScreen.author", "Your name"],
] as const;

/**
 * ConfigScreen component
 * Edits everything a fork owns outside the travel data itself: identity,
 * locales, city roles, map defaults, transport operators, and UNESCO counts.
 * @component
 * @param {ConfigScreenProps} props
 * @param {DataFile<SiteConfig>} props.file - Site configuration source file
 * @returns {ReactNode} The site settings screen
 */
export function ConfigScreen({ file }: ConfigScreenProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [value, setValue] = useState(file.value);
  const [newLocale, setNewLocale] = useState("");
  const [newCompanyId, setNewCompanyId] = useState("");
  const isDirty = JSON.stringify(value) !== JSON.stringify(file.value);
  const site = value.site ?? {};
  const map = value.map ?? config.value.map!;
  const locales = value.locales ?? [];
  const companies = value.companies ?? {};
  const cityOptions = cities.map(({ value: city }) => ({
    hint: city.countryId,
    iconUrl: findWorldCountry(city.countryId)?.flagUrl,
    label: city.name,
    value: city.id,
  }));
  const companyIdProblem = idError(newCompanyId, Object.keys(companies));

  /**
   * Replaces one company entry.
   * @param {string} id - Company identifier
   * @param {Company} company - Replacement company
   * @returns {void}
   */
  function setCompany(id: string, company: Company): void {
    setValue((current) => ({
      ...current,
      companies: { ...(current.companies ?? {}), [id]: company },
    }));
  }

  /**
   * Removes a company entry.
   * @param {string} id - Company identifier
   * @returns {void}
   */
  function removeCompany(id: string): void {
    setValue((current) => {
      const next = { ...(current.companies ?? {}) };
      delete next[id];
      return { ...current, companies: next };
    });
  }

  /**
   * Adds a company after checking its identifier is usable.
   * @returns {void}
   */
  function addCompany(): void {
    if (companyIdProblem) return;
    setCompany(newCompanyId, { name: newCompanyId });
    setNewCompanyId("");
  }

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
    <EditorForm
      eyebrow={t("configScreen.eyebrow")}
      isDirty={isDirty}
      onSave={() => writeData(file.path, value)}
      path={file.path}
      title={t("configScreen.title")}
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
              placeholder={placeholder}
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
          <ul className="config-screen__tags">
            {locales.map((locale) => (
              <li className="config-screen__tag" key={locale}>
                <code>{locale}</code>
                <button
                  aria-label={t("configScreen.removeLocale", { locale })}
                  className="config-screen__tag-remove"
                  onClick={() =>
                    setValue({
                      ...value,
                      locales: locales.filter((entry) => entry !== locale),
                    })
                  }
                  type="button"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="config-screen__add">
          <TextField
            label={t("configScreen.addLocale")}
            onChange={setNewLocale}
            placeholder="it-IT"
            value={newLocale}
          />
          <button className="editor-button" onClick={addLocale} type="button">
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
        <h2 className="editor-panel__legend">
          {t("configScreen.transportCompanies")}
        </h2>
        <p className="editor-panel__hint">
          {t("configScreen.transportCompaniesHint")}
        </p>
        {Object.entries(companies).map(([id, company]) => (
          <div className="config-screen__company" key={id}>
            <code className="config-screen__company-id">{id}</code>
            <TextField
              label={t("configScreen.name")}
              onChange={(name) => setCompany(id, { ...company, name })}
              value={company.name}
            />
            <ImageUploadField
              fileNameHint={id}
              hint={t("configScreen.svgOrPng")}
              label={t("configScreen.logo")}
              onUpload={(logo) => setCompany(id, { ...company, logo })}
              value={resolveLogoUrl(company.logo)}
            />
            <button
              aria-label={t("configScreen.removeCompany", { id })}
              className="editor-button"
              onClick={() => removeCompany(id)}
              type="button"
            >
              {t("configScreen.remove")}
            </button>
          </div>
        ))}
        <div className="config-screen__add">
          <TextField
            hint={
              newCompanyId
                ? (companyIdProblem ?? t("configScreen.readyToAdd"))
                : ""
            }
            label={t("configScreen.addCompanyId")}
            onChange={setNewCompanyId}
            placeholder="ryanair"
            value={newCompanyId}
          />
          <button
            className="editor-button"
            disabled={Boolean(companyIdProblem)}
            onClick={addCompany}
            type="button"
          >
            {t("configScreen.add")}
          </button>
        </div>
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          {t("configScreen.unescoSites")}
        </h2>
        <p className="editor-panel__hint">
          {t("configScreen.unescoSitesHint")}
        </p>
        {countries.map(({ value: country }) => (
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
    </EditorForm>
  );
}

/**
 * Props for ConfigScreen.
 * @property {DataFile<SiteConfig>} file - Site configuration source file
 */
interface ConfigScreenProps {
  file: DataFile<SiteConfig>;
}
