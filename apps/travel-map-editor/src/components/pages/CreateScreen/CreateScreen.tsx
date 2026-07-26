import {
  CityJson,
  Continent,
  CountryJson,
  Currency,
  formatLocalDate,
  TripJson,
} from "@travelmap/core";
import { ReactNode, useState } from "react";

import {
  cities,
  cityPath,
  continents,
  countries,
  countryPath,
  currencies,
  idError,
  reloadAt,
  tripPath,
  trips,
  writeData,
} from "../../../dataset";
import { SelectField, TextField } from "../../Fields/Fields";

/**
 * The kinds of document the editor can create.
 */
export type CreateKind = "country" | "city" | "trip";

const DEFAULT_COLOR = { h: 210, l: 50, s: 60 };
const TITLES: Record<CreateKind, string> = {
  city: "New city",
  country: "New country",
  trip: "New trip",
};
const ID_HINTS: Record<CreateKind, string> = {
  city: "Used as the folder name and the gallery URL segment, so keep it stable.",
  country: "Used as the folder name and referenced by every city and flag.",
  trip: "Used as the file name and the trip page URL.",
};

/**
 * CreateScreen component
 * Creates a country, city, or trip with the minimum fields needed to load,
 * then opens its editor. This is the only path that works when a fork starts
 * with no dataset at all.
 * @component
 * @param {CreateScreenProps} props
 * @param {CreateKind} props.kind - Which document to create
 * @returns {ReactNode} The creation screen
 */
export function CreateScreen({ kind }: CreateScreenProps): ReactNode {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState(countries[0]?.value.id ?? "");
  const [continent, setContinent] = useState<Continent>(Continent.EUROPE);
  const [currency, setCurrency] = useState<Currency>(Currency.EUR);
  const [message, setMessage] = useState("");
  const taken = { city: cities, country: countries, trip: trips }[kind].map(
    ({ value }) => value.id,
  );
  const invalidId = idError(id, taken);
  const blockers = [
    ...(invalidId ? [invalidId] : []),
    ...(name.trim() ? [] : ["A name is required."]),
    ...(kind === "city" && countries.length === 0
      ? ["Create a country first."]
      : []),
    ...(kind === "trip" && cities.length === 0 ? ["Create a city first."] : []),
  ];

  /**
   * Writes the new document and opens its editor.
   * @returns {Promise<void>} Completion after the write
   */
  async function handleCreate(): Promise<void> {
    if (blockers.length > 0) return;
    try {
      if (kind === "country") {
        const country: CountryJson = {
          id,
          name,
          color: DEFAULT_COLOR,
          continent,
          currency,
        };
        await writeData(countryPath(id), country);
        reloadAt(`/countries/${id}`);
        return;
      }
      if (kind === "city") {
        const city: CityJson = {
          id,
          name,
          countryId,
          coordinates: [0, 0],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        await writeData(cityPath(countryId, id), city);
        reloadAt(`/cities/${id}`);
        return;
      }
      // Midnight, so a new trip starts as a plain date. Time-of-day only exists
      // to order several stops within one calendar day.
      const now = new Date();
      const today = formatLocalDate(
        new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      );
      const originCityId = cities[0]!.value.id;
      const trip: TripJson = {
        id,
        title: name,
        sDate: today,
        eDate: today,
        originCityId,
        returnCityId: originCityId,
        steps: [],
      };
      await writeData(tripPath(id), trip);
      reloadAt(`/trips/${id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not create the file.",
      );
    }
  }
  return (
    <main className="editor__screen">
      <header className="editor__header">
        <div>
          <p className="editor__eyebrow">Create</p>
          <h1>{TITLES[kind]}</h1>
        </div>
      </header>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">Identity</h2>
        <TextField
          hint={ID_HINTS[kind]}
          label="Id"
          onChange={setId}
          placeholder={kind === "trip" ? "rome-trip-2026" : "Rome"}
          value={id}
        />
        <TextField
          label={kind === "trip" ? "Title" : "Name"}
          onChange={setName}
          value={name}
        />
        {kind === "city" ? (
          <SelectField
            label="Country"
            onChange={setCountryId}
            options={countries.map(({ value }) => ({
              label: value.name,
              value: value.id,
            }))}
            value={countryId}
          />
        ) : null}
        {kind === "country" ? (
          <div className="editor-panel__row">
            <SelectField
              label="Continent"
              onChange={(next) => setContinent(next as Continent)}
              options={continents.map((entry) => ({
                label: entry,
                value: entry,
              }))}
              value={continent}
            />
            <SelectField
              label="Currency"
              onChange={(next) => setCurrency(next as Currency)}
              options={currencies.map((entry) => ({
                label: entry,
                value: entry,
              }))}
              value={currency}
            />
          </div>
        ) : null}
      </section>
      {blockers.length > 0 && (id || name) ? (
        <ul className="editor-notice editor-notice--error">
          {blockers.map((blocker) => (
            <li className="editor-notice__item" key={blocker}>
              {blocker}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="editor-form__actions">
        <button
          className="editor-button editor-button--primary"
          disabled={blockers.length > 0}
          onClick={handleCreate}
          type="button"
        >
          Create
        </button>
        <output className="editor-form__message">{message}</output>
      </div>
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
