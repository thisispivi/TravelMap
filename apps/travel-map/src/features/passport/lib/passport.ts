import { City, Continent, COUNTRIES, Country, Trip } from "@travelmap/core";

/* Continents never entered follow the entered ones, in this order. */
const CONTINENT_ORDER = [
  Continent.EUROPE,
  Continent.ASIA,
  Continent.NORTH_AMERICA,
  Continent.SOUTH_AMERICA,
  Continent.AFRICA,
  Continent.OCEANIA,
  Continent.ANTARCTICA,
];

/**
 * One time a trip reached a country.
 * @property {Trip} trip - The trip
 * @property {Date} date - The day it arrived
 * @property {City} city - Where it arrived
 */
export interface PassportEntry {
  trip: Trip;
  date: Date;
  city: City;
}

/**
 * A country entered at least once.
 * @property {"stamp"} kind - The slot discriminator
 * @property {Country} country - The country
 * @property {PassportEntry[]} entries - Its entries, oldest first
 */
export interface StampSlot {
  kind: "stamp";
  country: Country;
  entries: PassportEntry[];
}

/**
 * A country only planned so far.
 * @property {"planned"} kind - The slot discriminator
 * @property {Country} country - The country
 * @property {Date} [date] - When the first planned trip reaches it, if a trip does
 */
interface PlannedSlot {
  kind: "planned";
  country: Country;
  date?: Date;
}

/** One of the places on a page: a stamp, or the sketch of one to come. */
export type PassportSlot = StampSlot | PlannedSlot;

/**
 * A page of the booklet.
 * @property {string} id - Stable across renders
 * @property {Continent} continent - The continent it holds
 * @property {PassportSlot[]} slots - Up to nine slots
 */
export interface PassportPage {
  id: string;
  continent: Continent;
  slots: PassportSlot[];
}

/**
 * How far a continent has been stamped.
 * @property {Continent} continent - The continent
 * @property {number} stamped - Countries with a stamp
 * @property {number} total - Countries the map has in the continent
 */
interface ContinentProgress {
  continent: Continent;
  stamped: number;
  total: number;
}

/**
 * The home country, on the booklet's own first page.
 * @property {StampSlot} slot - Its stamp, which never counts as a visit
 * @property {City} city - The home city
 */
export interface IssuingCountry {
  slot: StampSlot;
  city: City;
}

/**
 * The whole booklet.
 * @property {IssuingCountry | null} issuing - The issuing country, if a home is set
 * @property {PassportPage[]} pages - The continents' pages, in reading order
 * @property {ContinentProgress[]} continents - Each continent, in the pages' order
 * @property {number} stamps - Countries stamped
 * @property {number} continentsEntered - Continents with a stamp
 */
export interface Passport {
  issuing: IssuingCountry | null;
  pages: PassportPage[];
  continents: ContinentProgress[];
  stamps: number;
  continentsEntered: number;
}

/**
 * What the booklet is built from.
 * @property {Trip[]} visitedTrips - The trips taken
 * @property {Trip[]} futureTrips - The trips planned
 * @property {City[]} futureCities - The cities planned, by a trip or by hand
 * @property {City | null} homeCity - The home city
 * @property {number} perPage - How many stamps a page holds in the layout shown
 */
interface PassportSources {
  visitedTrips: Trip[];
  futureTrips: Trip[];
  futureCities: City[];
  homeCity: City | null;
  perPage: number;
}

/**
 * Finds where a trip first arrived in a country: its first stay there, or, for a
 * country it only touched, the first place seen. Passing through an airport is
 * no entry at all.
 * @param {Trip} trip - The trip
 * @param {Country} country - The country
 * @returns {PassportEntry | undefined} The entry, if the trip made one
 */
function entryOf(trip: Trip, country: Country): PassportEntry | undefined {
  const places = trip.destinations.filter(
    ({ city, kind }) => kind !== "stopover" && city.country.id === country.id,
  );
  const first = places.find(({ kind }) => kind === "stay") ?? places[0];
  if (!first) return undefined;

  return { city: first.city, date: first.sDate, trip };
}

/**
 * Collects every entry of every country the given trips reached.
 * @param {Trip[]} trips - The trips
 * @returns {StampSlot[]} One slot per country, the oldest first entry first
 */
function stampsFrom(trips: Trip[]): StampSlot[] {
  const countries = new Map<string, Country>();
  for (const trip of trips)
    for (const country of trip.getCountriesVisited())
      countries.set(country.id, country);

  return [...countries.values()]
    .map((country): StampSlot => {
      const entries = trips
        .flatMap((trip) => entryOf(trip, country) ?? [])
        .toSorted((first, second) => +first.date - +second.date);
      return { country, entries, kind: "stamp" };
    })
    .toSorted(
      (first, second) =>
        +(first.entries[0]?.date ?? 0) - +(second.entries[0]?.date ?? 0),
    );
}

/**
 * Collects the countries only planned: those of future trips, which know a date,
 * then those of hand-picked future cities, which do not.
 * @param {PassportSources} sources - The dataset
 * @param {Trip[]} sources.futureTrips - The trips planned
 * @param {City[]} sources.futureCities - The cities planned
 * @param {Set<string>} taken - Countries that already have a slot
 * @returns {PlannedSlot[]} One slot per country, soonest first
 */
function plannedFrom(
  { futureTrips, futureCities }: PassportSources,
  taken: Set<string>,
): PlannedSlot[] {
  const dates = new Map<string, Date>();
  for (const trip of futureTrips.toSorted(
    (first, second) => +first.sDate - +second.sDate,
  ))
    for (const { city, kind, sDate } of trip.destinations)
      if (kind !== "stopover" && !dates.has(city.country.id))
        dates.set(city.country.id, sDate);

  const countries = new Map<string, Country>();
  for (const { country } of futureCities) countries.set(country.id, country);
  for (const trip of futureTrips)
    for (const country of trip.getCountriesVisited())
      countries.set(country.id, country);

  return [...countries.values()]
    .filter(({ id }) => !taken.has(id))
    .map((country): PlannedSlot => ({
      country,
      date: dates.get(country.id),
      kind: "planned",
    }))
    .toSorted(
      (first, second) => +(first.date ?? Infinity) - +(second.date ?? Infinity),
    );
}

/**
 * Counts the countries of a continent nobody has a slot for yet. They get no page,
 * only a place in the continent's total, so the booklet holds what happened.
 * @param {Continent} continent - The continent
 * @param {Set<string>} taken - Countries that already have a slot, or are home
 * @returns {number} How many are still to see
 */
function remainingIn(continent: Continent, taken: Set<string>): number {
  return [...COUNTRIES.values()].filter(
    (country) => country.continent === continent && !taken.has(country.id),
  ).length;
}

/**
 * Binds the dataset into a booklet. Each continent's stamps come first, in order of
 * first entry, then what is planned; continents themselves run
 * in the order they were first entered. The home country gets its own page and
 * counts as no visit, however many trips stayed in it.
 * @param {PassportSources} sources - The dataset
 * @returns {Passport} The booklet
 */
export function buildPassport(sources: PassportSources): Passport {
  const { visitedTrips, homeCity, perPage } = sources;
  const homeId = homeCity?.country.id;
  const allStamps = stampsFrom(visitedTrips);
  const homeStamp = allStamps.find(({ country }) => country.id === homeId);
  const stamps = allStamps.filter(({ country }) => country.id !== homeId);
  const taken = new Set(stamps.map(({ country }) => country.id));
  if (homeId) taken.add(homeId);
  const planned = plannedFrom(sources, taken);
  for (const { country } of planned) taken.add(country.id);

  const entered = stamps.map(({ country }) => country.continent);
  const order = [...new Set([...entered, ...CONTINENT_ORDER])];

  /**
   * Lists a continent's slots: its stamps, then what is planned.
   * @param {Continent} continent - The continent
   * @returns {PassportSlot[]} Its slots
   */
  const slotsOf = (continent: Continent): PassportSlot[] =>
    [...stamps, ...planned].filter(
      ({ country }) => country.continent === continent,
    );

  const pages = order.flatMap((continent) => {
    const slots = slotsOf(continent);
    return Array.from(
      { length: Math.ceil(slots.length / perPage) },
      (_, index): PassportPage => ({
        continent,
        id: `${continent}-${index}`,
        slots: slots.slice(index * perPage, (index + 1) * perPage),
      }),
    );
  });

  return {
    continents: order.flatMap((continent) => {
      const slots = slotsOf(continent);
      return slots.length === 0
        ? []
        : [
            {
              continent,
              stamped: slots.filter(({ kind }) => kind === "stamp").length,
              total: slots.length + remainingIn(continent, taken),
            },
          ];
    }),
    continentsEntered: new Set(entered).size,
    issuing:
      homeCity && homeId
        ? {
            city: homeCity,
            slot: homeStamp ?? {
              country: homeCity.country,
              entries: [],
              kind: "stamp",
            },
          }
        : null,
    pages,
    stamps: stamps.length,
  };
}
