import "./CreateScreen.scss";

import { useLanguage } from "@app/hooks/language/language";
import { classNames } from "@app/utils/className";
import {
  CityJson,
  ColorData,
  CountryJson,
  formatLocalDate,
  TripJson,
} from "@travelmap/core";
import { domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useState } from "react";

import {
  cities,
  cityPath,
  countries,
  countryPath,
  idError,
  locales,
  reloadAt,
  tripPath,
  trips,
  writeData,
} from "../../../core/dataset";
import { translationsForLocales, WorldCountry } from "../../../core/world";
import { WorldCity } from "../../../core/worldCities";
import { TextField } from "../../atoms/Fields/Fields";
import { DatePicker } from "../../molecules/DatePicker/DatePicker";
import { WorldCitySearch } from "../../organisms/WorldCitySearch/WorldCitySearch";

/**
 * The kinds of document the editor can create. Countries are not among them:
 * one appears automatically with the first city placed inside it, which is the
 * only reason a country document needs to exist.
 */
export type CreateKind = "city" | "trip";

// Successive hues a third of the wheel apart, so countries added one after
// another never come out looking alike on the map.
const HUE_STEP = 137;
const DEFAULT_SATURATION = 68;
const DEFAULT_LIGHTNESS = 50;

/**
 * Picks a map colour for a newly created country, spaced away from the ones
 * already in the dataset.
 * @returns {ColorData} The suggested fill
 */
function nextCountryColor(): ColorData {
  return {
    h: (countries.length * HUE_STEP) % 360,
    l: DEFAULT_LIGHTNESS,
    s: DEFAULT_SATURATION,
  };
}

/**
 * Derives a stable id from a display name, keeping it readable in the URL and
 * on disk.
 * @param {string} name - The display name
 * @returns {string} The derived id
 */
function toId(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Writes the country document for a picked city when the dataset has none yet.
 * @param {WorldCountry} country - The country the city belongs to
 * @returns {Promise<void>} Completion once the country exists
 */
async function ensureCountry(country: WorldCountry): Promise<void> {
  if (countries.some(({ value }) => value.id === country.id)) return;
  const document: CountryJson = {
    id: country.id,
    name: country.name,
    nameByLocale: translationsForLocales(country, locales()),
    color: nextCountryColor(),
    continent: country.continent,
    currency: country.currency,
  };
  await writeData(countryPath(country.id), document);
}

/**
 * CityCreate component
 * Adds a city by finding it in the world gazetteer. Name, country,
 * coordinates, timezone, and population all come from the entry, and the
 * country document is written too when it is the first city there.
 * @component
 * @returns {ReactNode} The city creation screen
 */
function CityCreate(): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [picked, setPicked] = useState<WorldCity | null>(null);
  const [name, setName] = useState("");
  const [customId, setCustomId] = useState("");
  const [message, setMessage] = useState("");
  const id = customId || toId(name);
  const taken = cities.map(({ value }) => value.id);
  const isNewCountry =
    picked?.country !== undefined &&
    !countries.some(({ value }) => value.id === picked.country!.id);
  const problems = [
    ...(picked ? [] : [t("createScreen.findCityFirst")]),
    ...(picked && !picked.country ? [t("createScreen.countryNotOnMap")] : []),
    ...(name.trim() ? [] : [t("createScreen.nameRequired")]),
    ...(idError(id, taken) ? [idError(id, taken)!] : []),
  ];

  /**
   * Applies a gazetteer match to the form.
   * @param {WorldCity} city - The chosen city
   * @returns {void}
   */
  function handleSelect(city: WorldCity): void {
    setPicked(city);
    setName(city.name);
    setCustomId("");
    setMessage("");
  }

  /**
   * Writes the city, and its country when that is new, then opens its editor.
   * @returns {Promise<void>} Completion after the write
   */
  async function handleCreate(): Promise<void> {
    if (problems.length > 0 || !picked?.country) return;
    const city: CityJson = {
      id,
      name: name.trim(),
      countryId: picked.country.id,
      coordinates: picked.coordinates,
      population: picked.population,
      timeZone: picked.timeZone,
    };
    try {
      await ensureCountry(picked.country);
      await writeData(cityPath(picked.country.id, id), city);
      reloadAt(`/cities/${id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("createScreen.createError"),
      );
    }
  }
  return (
    <>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          {t("createScreen.findTheCity")}
        </h2>
        <p className="editor-panel__hint">{t("createScreen.findCityHint")}</p>
        <WorldCitySearch
          hint={t("createScreen.citySearchHint")}
          label={t("createScreen.city")}
          onSelect={handleSelect}
        />
      </section>
      {picked ? (
        <LazyMotion features={domAnimation}>
          <m.section
            animate={{ opacity: 1, y: 0 }}
            className="editor-panel"
            initial={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <h2 className="editor-panel__legend">
              {t("createScreen.whatWillBeCreated")}
            </h2>
            <div className="create-screen__preview">
              {picked.country?.flagUrl ? (
                <img
                  alt=""
                  className="create-screen__flag"
                  src={picked.country.flagUrl}
                />
              ) : null}
              <dl className="create-screen__facts">
                <div className="create-screen__fact">
                  <dt>{t("createScreen.country")}</dt>
                  <dd>
                    {picked.country?.name ?? picked.countryCode}
                    {isNewCountry ? (
                      <span className="create-screen__tag">
                        {t("createScreen.new")}
                      </span>
                    ) : null}
                  </dd>
                </div>
                <div className="create-screen__fact">
                  <dt>{t("createScreen.coordinates")}</dt>
                  <dd className="create-screen__mono">
                    {picked.coordinates[1].toFixed(4)},{" "}
                    {picked.coordinates[0].toFixed(4)}
                  </dd>
                </div>
                <div className="create-screen__fact">
                  <dt>{t("createScreen.timezone")}</dt>
                  <dd className="create-screen__mono">{picked.timeZone}</dd>
                </div>
                <div className="create-screen__fact">
                  <dt>{t("createScreen.population")}</dt>
                  <dd>{picked.population.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
            {isNewCountry ? (
              <p className="editor-panel__hint">
                {t("createScreen.newCountryHint", {
                  country: picked.country?.name,
                })}
              </p>
            ) : null}
          </m.section>
        </LazyMotion>
      ) : null}
      {picked ? (
        <section className="editor-panel">
          <h2 className="editor-panel__legend">{t("createScreen.naming")}</h2>
          <div className="editor-panel__row">
            <TextField
              hint={t("createScreen.nameHint")}
              label={t("createScreen.name")}
              onChange={setName}
              value={name}
            />
            <TextField
              hint={t("createScreen.idHint")}
              label={t("createScreen.id")}
              onChange={setCustomId}
              placeholder={toId(name)}
              value={customId || toId(name)}
            />
          </div>
        </section>
      ) : null}
      <CreateProblems problems={problems} show={Boolean(picked)} />
      <CreateActions
        isDisabled={problems.length > 0}
        message={message}
        onCreate={handleCreate}
      />
    </>
  );
}

/**
 * TripCreate component
 * Adds a trip with its title and date range, ready for an itinerary.
 * @component
 * @returns {ReactNode} The trip creation screen
 */
function TripCreate(): ReactNode {
  const { t } = useLanguage(["editor"]);
  const now = new Date();
  const today = formatLocalDate(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const [title, setTitle] = useState("");
  const [customId, setCustomId] = useState("");
  const [sDate, setSDate] = useState(today);
  const [eDate, setEDate] = useState(today);
  const [message, setMessage] = useState("");
  const derivedId = title.trim()
    ? `${toId(title).toLowerCase()}-${sDate.slice(0, 4)}`
    : "";
  const id = customId || derivedId;
  const taken = trips.map(({ value }) => value.id);
  const problems = [
    ...(title.trim() ? [] : [t("createScreen.titleRequired")]),
    ...(cities.length === 0 ? [t("createScreen.addCityFirst")] : []),
    ...(sDate && eDate && eDate < sDate
      ? [t("createScreen.endBeforeStart")]
      : []),
    ...(idError(id, taken) ? [idError(id, taken)!] : []),
  ];

  /**
   * Writes the new trip and opens its editor.
   * @returns {Promise<void>} Completion after the write
   */
  async function handleCreate(): Promise<void> {
    if (problems.length > 0) return;
    const originCityId = cities[0]!.value.id;
    const trip: TripJson = {
      id,
      title: title.trim(),
      sDate,
      eDate,
      originCityId,
      returnCityId: originCityId,
      steps: [],
    };
    try {
      await writeData(tripPath(id), trip);
      reloadAt(`/trips/${id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("createScreen.createError"),
      );
    }
  }
  return (
    <>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">{t("createScreen.details")}</h2>
        <TextField
          label={t("createScreen.title")}
          onChange={setTitle}
          placeholder="Rome Trip"
          value={title}
        />
        <div className="editor-panel__row">
          <DatePicker
            label={t("trip.start")}
            onChange={(next) => setSDate(next ?? today)}
            value={sDate}
            withTime={false}
          />
          <DatePicker
            label={t("trip.end")}
            onChange={(next) => setEDate(next ?? today)}
            value={eDate}
            withTime={false}
          />
        </div>
        <TextField
          hint={t("createScreen.tripIdHint")}
          label={t("createScreen.id")}
          onChange={setCustomId}
          placeholder={derivedId || "rome-trip-2026"}
          value={customId || derivedId}
        />
        <p className="editor-panel__hint">{t("createScreen.tripNextHint")}</p>
      </section>
      <CreateProblems problems={problems} show={Boolean(title)} />
      <CreateActions
        isDisabled={problems.length > 0}
        message={message}
        onCreate={handleCreate}
      />
    </>
  );
}

/**
 * CreateProblems component
 * Lists why a document cannot be created yet, once the author has started.
 * @component
 * @param {CreateProblemsProps} props
 * @param {string[]} props.problems - Reasons creation is blocked
 * @param {boolean} props.show - Whether to surface the list yet
 * @returns {ReactNode} The problem list, when there is one
 */
function CreateProblems({ problems, show }: CreateProblemsProps): ReactNode {
  if (!show || problems.length === 0) return null;
  return (
    <ul className="editor-notice editor-notice--error">
      {problems.map((problem) => (
        <li className="editor-notice__item" key={problem}>
          {problem}
        </li>
      ))}
    </ul>
  );
}

/**
 * Props for CreateProblems.
 * @property {string[]} problems - Reasons creation is blocked
 * @property {boolean} show - Whether to surface the list yet
 */
interface CreateProblemsProps {
  problems: string[];
  show: boolean;
}

/**
 * CreateActions component
 * The sticky create bar shared by every creation screen.
 * @component
 * @param {CreateActionsProps} props
 * @param {boolean} props.isDisabled - Whether creation is blocked
 * @param {string} props.message - Failure message, when a write failed
 * @param {() => Promise<void>} props.onCreate - Performs the creation
 * @returns {ReactNode} The action bar
 */
function CreateActions({
  isDisabled,
  message,
  onCreate,
}: CreateActionsProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <div className="editor-form__actions">
      <button
        className={classNames("editor-button", "editor-button--primary")}
        disabled={isDisabled}
        onClick={onCreate}
        type="button"
      >
        {t("createScreen.create")}
      </button>
      <output className="editor-form__message">{message}</output>
    </div>
  );
}

/**
 * Props for CreateActions.
 * @property {boolean} isDisabled - Whether creation is blocked
 * @property {string} message - Failure message, when a write failed
 * @property {() => Promise<void>} onCreate - Performs the creation
 */
interface CreateActionsProps {
  isDisabled: boolean;
  message: string;
  onCreate: () => Promise<void>;
}

/**
 * CreateScreen component
 * Routes to the creation flow for one document kind.
 * @component
 * @param {CreateScreenProps} props
 * @param {CreateKind} props.kind - Which document to create
 * @returns {ReactNode} The creation screen
 */
export function CreateScreen({ kind }: CreateScreenProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <main className="editor__screen">
      <header className="editor__header">
        <div>
          <p className="editor__eyebrow">{t("createScreen.eyebrow")}</p>
          <h1>{t(`createScreen.addA.${kind}`)}</h1>
        </div>
      </header>
      {kind === "city" ? <CityCreate /> : <TripCreate />}
    </main>
  );
}

/**
 * Props for CreateScreen.
 * @property {CreateKind} kind - Which document to create
 */
interface CreateScreenProps {
  kind: CreateKind;
}
