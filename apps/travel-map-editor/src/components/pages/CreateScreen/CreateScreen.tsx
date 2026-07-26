import "./CreateScreen.scss";

import {
  CityJson,
  ColorData,
  CountryJson,
  formatLocalDate,
  TripJson,
} from "@travelmap/core";
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
} from "../../../dataset";
import {
  findWorldCountry,
  translationsForLocales,
  worldCatalogue,
  WorldCountry,
} from "../../../world";
import { ColorField } from "../../ColorField/ColorField";
import { Combobox, ComboboxOption } from "../../Combobox/Combobox";
import { TextField } from "../../Fields/Fields";
import { PlaceImport } from "../../PlaceImport/PlaceImport";

/**
 * The kinds of document the editor can create.
 */
export type CreateKind = "country" | "city" | "trip";

const DEFAULT_COLOR: ColorData = { h: 200, l: 48, s: 75 };
const TITLES: Record<CreateKind, string> = {
  city: "Add a city",
  country: "Add a country",
  trip: "Add a trip",
};

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
 * CountryCreate component
 * Adds a country by picking it off the world map. Its name, translations,
 * continent, and currency all come from world data, so the colour is the only
 * thing to decide.
 * @component
 * @returns {ReactNode} The country creation screen
 */
function CountryCreate(): ReactNode {
  const [picked, setPicked] = useState<WorldCountry | null>(null);
  const [color, setColor] = useState<ColorData>(DEFAULT_COLOR);
  const [message, setMessage] = useState("");
  const existing = new Set(countries.map(({ value }) => value.id));
  const options: ComboboxOption[] = worldCatalogue
    .filter((country) => !existing.has(country.id))
    .map((country) => ({
      hint: existing.has(country.id) ? "added" : undefined,
      iconUrl: country.flagUrl,
      label: country.name,
      value: country.id,
    }));
  const configuredLocales = locales();
  const translations = picked
    ? translationsForLocales(picked, configuredLocales)
    : undefined;

  /**
   * Writes the picked country and opens its editor.
   * @returns {Promise<void>} Completion after the write
   */
  async function handleCreate(): Promise<void> {
    if (!picked) return;
    const country: CountryJson = {
      id: picked.id,
      name: picked.name,
      nameByLocale: translations,
      color,
      continent: picked.continent,
      currency: picked.currency,
    };
    try {
      await writeData(countryPath(picked.id), country);
      reloadAt(`/countries/${picked.id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create the file.",
      );
    }
  }
  return (
    <>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Pick a country</h2>
        <p className="editor-panel__hint">
          Every country the world map can draw is listed. Nothing about it needs
          typing.
        </p>
        <Combobox
          label="Country"
          onChange={(id) => setPicked(findWorldCountry(id) ?? null)}
          options={options}
          placeholder="Search all countries"
          value={picked?.id ?? ""}
        />
        {options.length === 0 ? (
          <p className="editor-panel__hint">
            Every country is already in your dataset.
          </p>
        ) : null}
      </section>
      {picked ? (
        <>
          <section className="editor-panel">
            <h2 className="editor-panel__legend">What will be created</h2>
            <div className="create-screen__preview">
              {picked.flagUrl ? (
                <img
                  alt=""
                  className="create-screen__flag"
                  src={picked.flagUrl}
                />
              ) : null}
              <dl className="create-screen__facts">
                <div className="create-screen__fact">
                  <dt>Name</dt>
                  <dd>{picked.name}</dd>
                </div>
                <div className="create-screen__fact">
                  <dt>Continent</dt>
                  <dd>{picked.continent.replace("_", " ").toLowerCase()}</dd>
                </div>
                <div className="create-screen__fact">
                  <dt>Currency</dt>
                  <dd>{picked.currency}</dd>
                </div>
                {configuredLocales.map((locale) => (
                  <div className="create-screen__fact" key={locale}>
                    <dt>{locale}</dt>
                    <dd>{translations?.[locale] ?? picked.name}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
          <section className="editor-panel">
            <h2 className="editor-panel__legend">Map colour</h2>
            <ColorField label="Fill" onChange={setColor} value={color} />
          </section>
        </>
      ) : null}
      <CreateActions
        isDisabled={!picked}
        message={message}
        onCreate={handleCreate}
      />
    </>
  );
}

/**
 * CityCreate component
 * Adds a city, taking its position from a pasted Google Maps link so the
 * coordinates never have to be transcribed by hand.
 * @component
 * @returns {ReactNode} The city creation screen
 */
function CityCreate(): ReactNode {
  const [name, setName] = useState("");
  const [customId, setCustomId] = useState("");
  const [countryId, setCountryId] = useState(countries[0]?.value.id ?? "");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [message, setMessage] = useState("");
  const id = customId || toId(name);
  const taken = cities.map(({ value }) => value.id);
  const problems = [
    ...(name.trim() ? [] : ["A name is required."]),
    ...(countries.length === 0 ? ["Add a country first."] : []),
    ...(idError(id, taken) ? [idError(id, taken)!] : []),
  ];

  /**
   * Writes the new city and opens its editor.
   * @returns {Promise<void>} Completion after the write
   */
  async function handleCreate(): Promise<void> {
    if (problems.length > 0) return;
    const city: CityJson = {
      id,
      name: name.trim(),
      countryId,
      coordinates: coordinates ?? [0, 0],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    try {
      await writeData(cityPath(countryId, id), city);
      reloadAt(`/cities/${id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create the file.",
      );
    }
  }
  return (
    <>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Where is it</h2>
        <p className="editor-panel__hint">
          Find the place in Google Maps and paste the link. The name and
          coordinates are read straight out of it.
        </p>
        <PlaceImport
          onImport={(place) => {
            setCoordinates(place.coordinates);
            if (place.name && !name) setName(place.name);
          }}
        />
        {coordinates ? (
          <p className="editor-notice editor-notice--success">
            <span className="editor-notice__item">
              Position set to {coordinates[1].toFixed(5)},{" "}
              {coordinates[0].toFixed(5)}. You can fine-tune it on the map after
              creating.
            </span>
          </p>
        ) : null}
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Details</h2>
        <div className="editor-panel__row">
          <TextField
            label="Name"
            onChange={setName}
            placeholder="Rome"
            value={name}
          />
          <Combobox
            label="Country"
            onChange={setCountryId}
            options={countries.map(({ value }) => ({
              iconUrl: findWorldCountry(value.id)?.flagUrl,
              label: value.name,
              value: value.id,
            }))}
            value={countryId}
          />
        </div>
        <TextField
          hint="Folder and gallery URL. Derived from the name — change it only if you need to."
          label="Id"
          onChange={setCustomId}
          placeholder={toId(name) || "Rome"}
          value={customId || toId(name)}
        />
      </section>
      <CreateProblems problems={problems} show={Boolean(name)} />
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
 * Adds a trip with the minimum a trip needs to load, ready for its itinerary.
 * @component
 * @returns {ReactNode} The trip creation screen
 */
function TripCreate(): ReactNode {
  const [title, setTitle] = useState("");
  const [customId, setCustomId] = useState("");
  const [message, setMessage] = useState("");
  const now = new Date();
  const today = formatLocalDate(
    new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const derivedId = title.trim()
    ? `${toId(title).toLowerCase()}-${now.getFullYear()}`
    : "";
  const id = customId || derivedId;
  const taken = trips.map(({ value }) => value.id);
  const problems = [
    ...(title.trim() ? [] : ["A title is required."]),
    ...(cities.length === 0 ? ["Add a city first."] : []),
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
      sDate: today,
      eDate: today,
      originCityId,
      returnCityId: originCityId,
      steps: [],
    };
    try {
      await writeData(tripPath(id), trip);
      reloadAt(`/trips/${id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create the file.",
      );
    }
  }
  return (
    <>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Details</h2>
        <TextField
          label="Title"
          onChange={setTitle}
          placeholder="Rome Trip"
          value={title}
        />
        <TextField
          hint="File name and trip page URL. Derived from the title."
          label="Id"
          onChange={setCustomId}
          placeholder={derivedId || "rome-trip-2026"}
          value={customId || derivedId}
        />
        <p className="editor-panel__hint">
          Dates and the itinerary are set next, on the trip screen.
        </p>
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
  return (
    <div className="editor-form__actions">
      <button
        className="editor-button editor-button--primary"
        disabled={isDisabled}
        onClick={onCreate}
        type="button"
      >
        Create
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
  return (
    <main className="editor__screen">
      <header className="editor__header">
        <div>
          <p className="editor__eyebrow">Create</p>
          <h1>{TITLES[kind]}</h1>
        </div>
      </header>
      {kind === "country" ? <CountryCreate /> : null}
      {kind === "city" ? <CityCreate /> : null}
      {kind === "trip" ? <TripCreate /> : null}
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
