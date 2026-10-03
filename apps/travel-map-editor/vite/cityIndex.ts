import type { City as GazetteerCity } from "all-the-cities";
import type { Plugin, ViteDevServer } from "vite";
import { z } from "zod";

import { assertLocalRequest, errorBody, sendJson } from "./http.ts";

/**
 * One gazetteer match returned to the editor.
 * @property {[number, number]} coordinates - Longitude and latitude, in dataset order
 * @property {string} countryCode - The ISO 3166-1 alpha-2 country code
 * @property {string} key - A stable identity for list rendering
 * @property {string} name - The city's local name
 * @property {number} population - Inhabitants
 * @property {string} timeZone - The IANA timezone covering the coordinates
 */
interface CityMatch {
  coordinates: [number, number];
  countryCode: string;
  key: string;
  name: string;
  population: number;
  timeZone: string;
}

/*
 * Hamlets make matches worse rather than better, and it is the recognisable
 * places an author is looking for.
 */
const MINIMUM_POPULATION = 5_000;
const DEFAULT_LIMIT = 30;

const CoordinateQuerySchema = z.strictObject({
  lat: z
    .string()
    .trim()
    .min(1)
    .pipe(z.coerce.number<string>().min(-90).max(90)),
  lon: z
    .string()
    .trim()
    .min(1)
    .pipe(z.coerce.number<string>().min(-180).max(180)),
});
const SearchQuerySchema = z.object({
  q: z.string().trim().max(200).default(""),
  limit: z
    .string()
    .regex(/^\d+$/)
    .pipe(z.coerce.number<string>().int().min(1).max(100))
    .optional(),
});

let gazetteer: GazetteerCity[] | undefined;
let lookupTimeZone:
  ((latitude: number, longitude: number) => string) | undefined;

/**
 * Loads and filters the gazetteer on first lookup. Both packages are CommonJS
 * and read several megabytes from disk, so they stay on the Node side of the dev
 * server and out of its startup path until an author actually searches.
 * @returns {Promise<GazetteerCity[]>} Every city above the population floor
 */
async function loadGazetteer(): Promise<GazetteerCity[]> {
  if (gazetteer) return gazetteer;
  const [{ default: cities }, { default: tzLookup }] = await Promise.all([
    import("all-the-cities"),
    import("tz-lookup"),
  ]);
  lookupTimeZone = tzLookup;
  gazetteer = cities.filter((city) => city.population >= MINIMUM_POPULATION);
  return gazetteer;
}

/**
 * Normalises a name for comparison, so "Reykjavik" finds "Reykjavík".
 * @param {string} value - The text to fold
 * @returns {string} The folded text
 */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Ranks cities against a search term. Prefix matches outrank contained ones,
 * and population breaks ties so a capital beats a same-named village.
 * @param {GazetteerCity[]} cities - The loaded gazetteer
 * @param {string} term - The search term
 * @param {number} limit - Maximum matches to return
 * @returns {CityMatch[]} The ranked matches
 */
function rank(
  cities: GazetteerCity[],
  term: string,
  limit: number,
): CityMatch[] {
  const needle = fold(term);
  const scored: { city: GazetteerCity; score: number }[] = [];

  for (const city of cities) {
    const name = fold(city.name);
    const at = name.indexOf(needle);
    if (at === -1) continue;
    /* Exact match first, then a prefix match, then a match anywhere. */
    const score = name === needle ? 0 : at === 0 ? 1 : 2;
    scored.push({ city, score });
  }
  scored.sort(
    (first, second) =>
      first.score - second.score ||
      second.city.population - first.city.population,
  );

  return scored.slice(0, limit).map(({ city }) => {
    const [longitude, latitude] = city.loc.coordinates;
    return {
      coordinates: [longitude, latitude],
      countryCode: city.country,
      key: String(city.cityId),
      name: city.name,
      population: city.population,
      timeZone: lookupTimeZone?.(latitude, longitude) ?? "UTC",
    };
  });
}

/**
 * Serves world city lookups from the development server.
 * @returns {Plugin} Serve-only Vite plugin
 */
export function cityIndex(): Plugin {
  return {
    name: "city-index",
    apply: "serve",

    /**
     * Installs the city search and timezone endpoints.
     * @param {ViteDevServer} server - Editor development server
     * @returns {void}
     */
    configureServer(server: ViteDevServer): void {
      server.middlewares.use("/__cities", async (request, response) => {
        try {
          assertLocalRequest(request);
          if (request.method !== "GET") {
            sendJson(response, 405, { error: "Use GET for city lookups." });
            return;
          }
          const url = new URL(request.url ?? "", "http://localhost");

          if (url.pathname === "/timezone") {
            const coordinates = CoordinateQuerySchema.safeParse(
              Object.fromEntries(url.searchParams),
            );
            if (!coordinates.success) {
              sendJson(response, 400, { error: "Invalid coordinates." });
              return;
            }
            await loadGazetteer();
            sendJson(response, 200, {
              timeZone:
                lookupTimeZone?.(coordinates.data.lat, coordinates.data.lon) ??
                "UTC",
            });
            return;
          }

          const query = SearchQuerySchema.safeParse(
            Object.fromEntries(url.searchParams),
          );
          if (!query.success) {
            sendJson(response, 400, {
              error: "Invalid city search parameters.",
            });
            return;
          }
          const term = query.data.q;
          if (term.length < 2) {
            sendJson(response, 200, { matches: [] });
            return;
          }
          const cities = await loadGazetteer();
          const limit = query.data.limit ?? DEFAULT_LIMIT;
          sendJson(response, 200, { matches: rank(cities, term, limit) });
        } catch (error) {
          sendJson(response, 500, errorBody(error, "City lookup failed."));
        }
      });
    },
  };
}
