import { Country, CountryEntry } from "../classes/Country.ts";
import { Continent } from "../typings/Continent.ts";
import { AFRICA } from "./africa.ts";
import { ANTARCTICA } from "./antarctica.ts";
import { ASIA } from "./asia.ts";
import { EUROPE } from "./europe.ts";
import { NORTH_AMERICA } from "./northAmerica.ts";
import { OCEANIA } from "./oceania.ts";
import { SOUTH_AMERICA } from "./southAmerica.ts";

/*
 * One file per continent, each keyed by code, so a country is found by where it
 * is and edited in one place. Together they cover every polygon of the world
 * map; territories with no ISO code use the user-assigned X range.
 */
const CONTINENTS: Record<Continent, Record<string, CountryEntry>> = {
  [Continent.AFRICA]: AFRICA,
  [Continent.ANTARCTICA]: ANTARCTICA,
  [Continent.ASIA]: ASIA,
  [Continent.EUROPE]: EUROPE,
  [Continent.NORTH_AMERICA]: NORTH_AMERICA,
  [Continent.OCEANIA]: OCEANIA,
  [Continent.SOUTH_AMERICA]: SOUTH_AMERICA,
};

/** Every country of the world map, by code. */
export const COUNTRIES: ReadonlyMap<string, Country> = new Map(
  Object.values(Continent).flatMap((continent) =>
    Object.entries(CONTINENTS[continent]).map(
      ([code, entry]): [string, Country] => [
        code,
        new Country(code, continent, entry),
      ],
    ),
  ),
);

const BY_MAP_NAME = new Map(
  Array.from(COUNTRIES.values(), (country) => [country.mapName, country]),
);

/**
 * Finds a country by its code.
 * @param {string} code - The country's code
 * @returns {Country | undefined} The country, if the catalogue has it
 */
export function findCountry(code: string): Country | undefined {
  return COUNTRIES.get(code);
}

/**
 * Finds the country a map polygon draws.
 * @param {string} mapName - The polygon's name in the map's own data
 * @returns {Country | undefined} The country, if the catalogue has it
 */
export function countryOnMap(mapName: string): Country | undefined {
  return BY_MAP_NAME.get(mapName);
}
