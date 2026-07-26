import "./ConfigScreen.scss";

import { ReactNode, useState } from "react";

import {
  cities,
  Company,
  config,
  countries,
  DataFile,
  idError,
  SiteConfig,
  writeData,
} from "../../../dataset";
import { findWorldCountry } from "../../../world";
import { Combobox, MultiCombobox } from "../../Combobox/Combobox";
import { EditorForm } from "../../EditorForm/EditorForm";
import { NumberField, StringListField, TextField } from "../../Fields/Fields";

const MAP_ZOOM_FIELDS = [
  ["defaultZoom", "Default zoom"],
  ["defaultMinZoom", "Minimum zoom"],
  ["defaultMaxZoom", "Maximum zoom"],
  ["hoveredCityZoom", "Hovered-city zoom"],
] as const;

const SITE_FIELDS = [
  ["name", "Name", "My Travels"],
  ["domain", "Domain", "map.example.com"],
  ["description", "Description", "A personal map of travels."],
  ["author", "Author", "Your name"],
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
      eyebrow="Settings"
      isDirty={isDirty}
      onSave={() => writeData(file.path, value)}
      path={file.path}
      title="Configuration"
    >
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Site metadata</h2>
        <div className="editor-panel__row">
          {SITE_FIELDS.map(([key, label, placeholder]) => (
            <TextField
              key={key}
              label={label}
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
          hint="Comma separated."
          label="Keywords"
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
        <h2 className="editor-panel__legend">Locales</h2>
        <p className="editor-panel__hint">
          Every country, city, and trip can carry a translated name for each
          locale listed here.
        </p>
        {locales.length > 0 ? (
          <ul className="config-screen__tags">
            {locales.map((locale) => (
              <li className="config-screen__tag" key={locale}>
                <code>{locale}</code>
                <button
                  aria-label={`Remove ${locale}`}
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
            label="Add locale"
            onChange={setNewLocale}
            placeholder="it-IT"
            value={newLocale}
          />
          <button className="editor-button" onClick={addLocale} type="button">
            Add
          </button>
        </div>
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">City roles</h2>
        <Combobox
          emptyLabel="None"
          label="Home city"
          onChange={(homeCityId) =>
            setValue({ ...value, homeCityId: homeCityId || null })
          }
          options={cityOptions}
          value={value.homeCityId ?? ""}
        />
        <div className="editor-panel__row">
          <MultiCombobox
            label="Former homes"
            onChange={(livedCityIds) => setValue({ ...value, livedCityIds })}
            options={cityOptions}
            value={value.livedCityIds ?? []}
          />
          <MultiCombobox
            label="Future cities"
            onChange={(futureCityIds) => setValue({ ...value, futureCityIds })}
            options={cityOptions}
            value={value.futureCityIds ?? []}
          />
        </div>
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Map defaults</h2>
        <div className="editor-panel__row">
          <NumberField
            label="Longitude"
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
            label="Latitude"
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
          {MAP_ZOOM_FIELDS.map(([key, label]) => (
            <NumberField
              key={key}
              label={label}
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
        <h2 className="editor-panel__legend">Trip display</h2>
        <NumberField
          label="Group-by-cities cutoff year"
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
        <h2 className="editor-panel__legend">Transport companies</h2>
        <p className="editor-panel__hint">
          Airlines and ferry operators offered when authoring transport steps.
          The logo path is served by the public app.
        </p>
        {Object.entries(companies).map(([id, company]) => (
          <div className="config-screen__company" key={id}>
            <code className="config-screen__company-id">{id}</code>
            <TextField
              label="Name"
              onChange={(name) => setCompany(id, { ...company, name })}
              value={company.name}
            />
            <TextField
              label="Logo"
              onChange={(logo) =>
                setCompany(id, { ...company, logo: logo || undefined })
              }
              placeholder="/logos/Example.svg"
              value={company.logo ?? ""}
            />
            <button
              aria-label={`Remove ${id}`}
              className="editor-button"
              onClick={() => removeCompany(id)}
              type="button"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="config-screen__add">
          <TextField
            hint={newCompanyId ? (companyIdProblem ?? "Ready to add.") : ""}
            label="Add company id"
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
            Add
          </button>
        </div>
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">UNESCO sites</h2>
        <p className="editor-panel__hint">
          Only used to count how many sites you have visited. Leave empty to
          show a zero.
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
