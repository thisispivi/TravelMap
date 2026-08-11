import {
  findWorldCountryByCode,
  WorldCountry,
} from "../../../shared/lib/worldCountries";

/**
 * A city from the world gazetteer, ready to become a dataset document.
 * @property {[number, number]} coordinates - Longitude and latitude, in dataset order
 * @property {WorldCountry} [country] - The owning country, when the map knows it
 * @property {string} countryCode - The ISO 3166-1 alpha-2 country code
 * @property {string} key - A stable identity for list rendering
 * @property {string} name - The city's local name
 * @property {number} population - Inhabitants, used to rank matches
 * @property {string} timeZone - The IANA timezone covering the coordinates
 */
export interface WorldCity {
  coordinates: [number, number];
  country?: WorldCountry;
  countryCode: string;
  key: string;
  name: string;
  population: number;
  timeZone: string;
}

/**
 * The gazetteer response, before countries are attached.
 * @property {Omit<WorldCity, "country">[]} matches - The ranked matches
 */
interface CityResponse {
  matches: Omit<WorldCity, "country">[];
}

/**
 * Finds world cities matching a search term.
 * The gazetteer and the timezone database are both Node-only packages that
 * read data files from disk, so the search runs on the editor's development
 * server. That also keeps several megabytes of city data out of the browser.
 * @param {string} term - The search term
 * @param {number} limit - Maximum results to return
 * @param {AbortSignal} [signal] - Cancels a superseded search
 * @returns {Promise<WorldCity[]>} The ranked matches
 */
export async function searchWorldCities(
  term: string,
  limit: number,
  signal?: AbortSignal,
): Promise<WorldCity[]> {
  const trimmed = term.trim();
  if (trimmed.length < 2) return [];
  const response = await fetch(
    `/__cities?q=${encodeURIComponent(trimmed)}&limit=${limit}`,
    { signal },
  );
  if (!response.ok) throw new Error("City search failed.");
  const { matches } = (await response.json()) as CityResponse;

  return matches.map((match) => ({
    ...match,
    country: findWorldCountryByCode(match.countryCode),
  }));
}

/**
 * Resolves the timezone for a coordinate the author placed by hand.
 * @param {[number, number]} coordinates - Longitude and latitude
 * @returns {Promise<string | undefined>} The IANA timezone, when it resolves
 */
export async function timeZoneAt(
  coordinates: [number, number],
): Promise<string | undefined> {
  const response = await fetch(
    `/__cities/timezone?lat=${coordinates[1]}&lon=${coordinates[0]}`,
  );
  if (!response.ok) return undefined;
  const { timeZone } = (await response.json()) as { timeZone: string };
  return timeZone;
}
