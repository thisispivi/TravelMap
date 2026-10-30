import { Continent, Currency, toId } from "@travelmap/core";
import countriesTopologyJson from "@travelmap/ui/assets/json/countries-50m.json";
import { hasFlag } from "@travelmap/ui/lib/flagPack";
import { flagUrl } from "@travelmap/ui/lib/flags";
import type { GeometryCollection, Topology } from "topojson-specification";
import worldCountries from "world-countries";

/*
 * Country ids are Natural Earth polygon names in the dataset's id form
 * (`UnitedKingdom`), the same form country folders and flag files use. Display
 * metadata comes from world-countries, joined through the topology's numeric
 * ISO code.
 */
const topology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection<{ name: string }>;
}>;

const CONTINENT_BY_REGION: Record<string, Continent> = {
  Africa: Continent.AFRICA,
  Antarctic: Continent.ANTARCTICA,
  Asia: Continent.ASIA,
  Europe: Continent.EUROPE,
  Oceania: Continent.OCEANIA,
};

/* world-countries uses the subregion to distinguish the two Americas. */
const SOUTH_AMERICAN_SUBREGIONS = new Set(["South America"]);

/**
 * One selectable country, combining the map polygon with its real-world
 * metadata so nothing about it has to be typed by hand.
 * @property {string} cca2 - The ISO 3166-1 alpha-2 code, used to join world cities
 * @property {Continent} continent - The continent the country belongs to
 * @property {Currency} currency - The country's primary currency
 * @property {string} [flagUrl] - Resolved flag asset, absent when the pack has no match
 * @property {string} id - The dataset id, the Natural Earth polygon name in id form
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
 * Finds a country's flag. The pack is missing a few countries outright, so a
 * country without one is expected rather than an error.
 * @param {string} id - The country id
 * @returns {string | undefined} The flag asset URL, when one exists
 */
function resolveFlag(id: string): string | undefined {
  return hasFlag(id) ? flagUrl(id) : undefined;
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
  const metadataByName = new Map(
    worldCountries.map((country) => [country.name.common, country]),
  );
  const currencyCodes = new Set(Object.values(Currency) as string[]);
  const catalogue: WorldCountry[] = [];

  for (const geometry of topology.objects.countries.geometries) {
    const polygonName = (geometry.properties as { name?: string } | undefined)
      ?.name;
    if (!polygonName) continue;
    /*
     * A polygon with no numeric ISO code, such as Kosovo's, is joined by name
     * instead; one the standard does not cover at all keeps its map name.
     */
    const metadata =
      (geometry.id ? metadataByCode.get(String(geometry.id)) : undefined) ??
      metadataByName.get(polygonName);

    /* Polygons without ISO metadata remain selectable under their map name. */
    if (!metadata) {
      catalogue.push({
        cca2: "",
        continent: Continent.EUROPE,
        currency: Currency.USD,
        flagUrl: resolveFlag(toId(polygonName)),
        id: toId(polygonName),
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
      flagUrl: resolveFlag(toId(polygonName)),
      id: toId(polygonName),
      name: metadata.name.common,
    });
  }
  return catalogue.sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

const worldCatalogue = buildCatalogue();

const catalogueById = new Map(
  worldCatalogue.map((country) => [country.id, country]),
);
const catalogueByCode = new Map(
  worldCatalogue
    .filter((country) => country.cca2)
    .map((country) => [country.cca2, country]),
);

/*
 * Territories with their own ISO code but no polygon of their own on the
 * 1:50m map, which draws them as part of the country that governs them.
 */
const GOVERNING_COUNTRY_CODES: Record<string, string> = {
  GF: "FR",
  GI: "GB",
  GP: "FR",
  MQ: "FR",
  RE: "FR",
  YT: "FR",
};

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
 * city dataset refers to countries. A territory the map draws inside another
 * country, such as Réunion, resolves to that country.
 * @param {string} code - The alpha-2 country code
 * @returns {WorldCountry | undefined} The catalogue entry, when known
 */
export function findWorldCountryByCode(code: string): WorldCountry | undefined {
  return catalogueByCode.get(GOVERNING_COUNTRY_CODES[code] ?? code);
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
