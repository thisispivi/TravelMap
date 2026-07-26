import countriesTopologyJson from "@app/assets/json/countries-50m.json";
import { Continent, Currency } from "@travelmap/core";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldCountries from "world-countries";

// The public map fills a country by matching the Natural Earth polygon name
// against the country id, so ids are not free-form: they must be the polygon
// name, abbreviations ("S. Sudan") included. Everything an author actually
// reads — display name, translations, flag — comes from world-countries
// instead, joined on the ISO 3166-1 numeric code the topology carries.
const topology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection<{ name: string }>;
}>;

// Vite serves the public app's flag pack from its own source tree, so the
// editor cannot reference /flags/*.svg the way the site does.
const flagUrls = import.meta.glob<string>(
  "../../travel-map/public/flags/*.svg",
  { eager: true, import: "default", query: "?url" },
);
const flagsByName = new Map(
  Object.entries(flagUrls).map(([path, url]) => [
    path.slice(path.lastIndexOf("/") + 1, -".svg".length),
    url,
  ]),
);

const CONTINENT_BY_REGION: Record<string, Continent> = {
  Africa: Continent.AFRICA,
  Antarctic: Continent.ANTARCTICA,
  Asia: Continent.ASIA,
  Europe: Continent.EUROPE,
  Oceania: Continent.OCEANIA,
};

// world-countries groups both American continents under one region, so the
// subregion decides which of the two enum values applies.
const SOUTH_AMERICAN_SUBREGIONS = new Set(["South America"]);

// world-countries keys translations by ISO 639-3, while locales are BCP 47.
const TRANSLATION_BY_LANGUAGE: Record<string, string> = {
  ar: "ara",
  cs: "ces",
  de: "deu",
  es: "spa",
  et: "est",
  fa: "per",
  fi: "fin",
  fr: "fra",
  hr: "hrv",
  hu: "hun",
  it: "ita",
  ja: "jpn",
  ko: "kor",
  nl: "nld",
  pl: "pol",
  pt: "por",
  ru: "rus",
  sk: "slk",
  sr: "srp",
  sv: "swe",
  tr: "tur",
  ur: "urd",
  zh: "zho",
};

/**
 * One selectable country, combining the map polygon with its real-world
 * metadata so nothing about it has to be typed by hand.
 * @property {Continent} continent - The continent the country belongs to
 * @property {Currency} currency - The country's primary currency
 * @property {string} [flagUrl] - Resolved flag asset, absent when the pack has no match
 * @property {string} id - The Natural Earth polygon name, used to fill the map
 * @property {[number, number]} [latlng] - Approximate country centre as longitude and latitude
 * @property {string} name - The common English name
 * @property {Record<string, string>} translations - Common name keyed by ISO 639-1 language
 */
export interface WorldCountry {
  continent: Continent;
  currency: Currency;
  flagUrl?: string;
  id: string;
  latlng?: [number, number];
  name: string;
  translations: Record<string, string>;
}

/**
 * Converts a country name into the flag pack's file naming.
 * @param {string} name - A country name
 * @returns {string} The candidate file base name
 */
function toFlagName(name: string): string {
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
 * Finds a flag for a country, trying the naming variants the pack uses. The
 * pack abbreviates saints and drops articles, and is missing a few countries
 * outright, so an unresolved flag is expected rather than an error.
 * @param {string[]} names - Candidate names, most preferred first
 * @returns {string | undefined} The flag asset URL, when one exists
 */
function resolveFlag(names: string[]): string | undefined {
  for (const name of names) {
    const base = toFlagName(name);
    const candidates = [
      base,
      base.replace(/^Saint/, "St"),
      base.replace(/^Saint/, "St").replace(/AndThe/, "And"),
      base.replace(/^UnitedStates/, "Us"),
      base.replace(/Islands$/, "Is"),
      base.replace(/^The/, ""),
    ];
    for (const candidate of candidates) {
      const url = flagsByName.get(candidate);
      if (url) return url;
    }
  }
  return undefined;
}

/**
 * Maps a world-countries region and subregion onto the domain's continents.
 * @param {string} region - The world-countries region
 * @param {string} subregion - The world-countries subregion
 * @returns {Continent} The matching continent
 */
function toContinent(region: string, subregion: string): Continent {
  const mapped = CONTINENT_BY_REGION[region];
  if (mapped) return mapped;
  return SOUTH_AMERICAN_SUBREGIONS.has(subregion)
    ? Continent.SOUTH_AMERICA
    : Continent.NORTH_AMERICA;
}

/**
 * Builds the catalogue of every country the world map can draw, ordered by
 * display name.
 * @returns {WorldCountry[]} The selectable countries
 */
function buildCatalogue(): WorldCountry[] {
  const metadataByCode = new Map(
    worldCountries.map((country) => [country.ccn3, country]),
  );
  const currencyCodes = new Set(Object.values(Currency) as string[]);
  const catalogue: WorldCountry[] = [];

  for (const geometry of topology.objects.countries.geometries) {
    const polygonName = (geometry.properties as { name?: string } | undefined)
      ?.name;
    if (!polygonName) continue;
    const metadata = geometry.id
      ? metadataByCode.get(String(geometry.id))
      : undefined;

    // Disputed and unrecognised territories have a polygon but no ISO entry.
    // They stay selectable using the polygon name alone, and an author can
    // correct the continent and currency by hand afterwards.
    if (!metadata) {
      catalogue.push({
        continent: Continent.EUROPE,
        currency: Currency.USD,
        flagUrl: resolveFlag([polygonName]),
        id: polygonName,
        name: polygonName,
        translations: {},
      });
      continue;
    }

    const currencyCode = Object.keys(metadata.currencies)[0];
    const [latitude, longitude] = metadata.latlng;
    const translations: Record<string, string> = {};
    for (const [language, key] of Object.entries(TRANSLATION_BY_LANGUAGE)) {
      const translated = metadata.translations[key]?.common;
      if (translated) translations[language] = translated;
    }

    catalogue.push({
      continent: toContinent(metadata.region, metadata.subregion),
      currency:
        currencyCode && currencyCodes.has(currencyCode)
          ? (currencyCode as Currency)
          : Currency.USD,
      flagUrl: resolveFlag([metadata.name.common, polygonName]),
      id: polygonName,
      latlng: [longitude ?? 0, latitude ?? 0],
      name: metadata.name.common,
      translations,
    });
  }
  return catalogue.sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

export const worldCatalogue = buildCatalogue();

/**
 * Looks up a country in the catalogue by its dataset id.
 * @param {string} id - The country id
 * @returns {WorldCountry | undefined} The catalogue entry, when known
 */
export function findWorldCountry(id: string): WorldCountry | undefined {
  return worldCatalogue.find((country) => country.id === id);
}

/**
 * Picks the translated names for the locales a fork has configured.
 * @param {WorldCountry} country - The catalogue entry
 * @param {string[]} locales - Configured BCP 47 locale tags
 * @returns {Record<string, string> | undefined} Names by locale, when any apply
 */
export function translationsForLocales(
  country: WorldCountry,
  locales: string[],
): Record<string, string> | undefined {
  const names: Record<string, string> = {};
  for (const locale of locales) {
    const translated = country.translations[locale.split("-")[0]!];
    if (translated && translated !== country.name) names[locale] = translated;
  }
  return Object.keys(names).length > 0 ? names : undefined;
}
