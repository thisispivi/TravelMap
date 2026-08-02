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
  "../../../travel-map/public/flags/*.svg",
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

/**
 * One selectable country, combining the map polygon with its real-world
 * metadata so nothing about it has to be typed by hand.
 * @property {string} cca2 - The ISO 3166-1 alpha-2 code, used to join world cities
 * @property {Continent} continent - The continent the country belongs to
 * @property {Currency} currency - The country's primary currency
 * @property {string} [flagUrl] - Resolved flag asset, absent when the pack has no match
 * @property {string} id - The Natural Earth polygon name, used to fill the map
 * @property {string} name - The common English name
 */
export interface WorldCountry {
  cca2: string;
  continent: Continent;
  currency: Currency;
  flagUrl?: string;
  id: string;
  name: string;
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
        cca2: "",
        continent: Continent.EUROPE,
        currency: Currency.USD,
        flagUrl: resolveFlag([polygonName]),
        id: polygonName,
        name: polygonName,
      });
      continue;
    }

    const currencyCode = Object.keys(metadata.currencies)[0];
    catalogue.push({
      cca2: metadata.cca2,
      continent: toContinent(metadata.region, metadata.subregion),
      currency:
        currencyCode && currencyCodes.has(currencyCode)
          ? (currencyCode as Currency)
          : Currency.USD,
      flagUrl: resolveFlag([metadata.name.common, polygonName]),
      id: polygonName,
      name: metadata.name.common,
    });
  }
  return catalogue.sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

export const worldCatalogue = buildCatalogue();

const catalogueById = new Map(
  worldCatalogue.map((country) => [country.id, country]),
);
const catalogueByCode = new Map(
  worldCatalogue
    .filter((country) => country.cca2)
    .map((country) => [country.cca2, country]),
);

/**
 * Looks up a country in the catalogue by its dataset id.
 * @param {string} id - The country id
 * @returns {WorldCountry | undefined} The catalogue entry, when known
 */
export function findWorldCountry(id: string): WorldCountry | undefined {
  return catalogueById.get(id);
}

/**
 * Looks up a country by its ISO 3166-1 alpha-2 code, which is how the world
 * city dataset refers to countries.
 * @param {string} code - The alpha-2 country code
 * @returns {WorldCountry | undefined} The catalogue entry, when known
 */
export function findWorldCountryByCode(code: string): WorldCountry | undefined {
  return catalogueByCode.get(code);
}

/**
 * Names a country in one locale using the platform's own CLDR data, which
 * covers far more locales than any bundled translation table would.
 * @param {string} code - The alpha-2 country code
 * @param {string} locale - A BCP 47 locale tag
 * @returns {string | undefined} The localised name, when the platform knows it
 */
function localisedCountryName(
  code: string,
  locale: string,
): string | undefined {
  if (!code) return undefined;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code);
  } catch {
    // An unsupported locale tag costs the translation, not the country.
    return undefined;
  }
}

/**
 * Picks the translated names for the locales a fork has configured, dropping
 * any that match the canonical name.
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
    const translated = localisedCountryName(country.cca2, locale);
    if (translated && translated !== country.name) names[locale] = translated;
  }
  return Object.keys(names).length > 0 ? names : undefined;
}
