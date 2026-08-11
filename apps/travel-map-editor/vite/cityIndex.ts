import type { ServerResponse } from "node:http";

import type { Plugin, ViteDevServer } from "vite";

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

/**
 * The gazetteer entry shape, declared locally because the package ships no
 * types.
 * @property {number} cityId - The GeoNames identifier
 * @property {string} country - The alpha-2 country code
 * @property {{ coordinates: [number, number] }} loc - The point geometry
 * @property {string} name - The city name
 * @property {number} population - Inhabitants
 */
interface GazetteerCity {
  cityId: number;
  country: string;
  loc: { coordinates: [number, number] };
  name: string;
  population: number;
}

// Hamlets make matches worse rather than better, and it is the recognisable
// places an author is looking for.
const MINIMUM_POPULATION = 5_000;
const DEFAULT_LIMIT = 30;

let gazetteer: GazetteerCity[] | undefined;
let lookupTimeZone: ((lat: number, lon: number) => string) | undefined;

/**
 * Loads the gazetteer once. Both packages are CommonJS and read data files
 * from disk, so they only work here on the Node side of the dev server — which
 * also keeps several megabytes out of the browser.
 * @returns {Promise<GazetteerCity[]>} Every city above the population floor
 */
async function loadGazetteer(): Promise<GazetteerCity[]> {
  if (gazetteer) return gazetteer;
  const [citiesModule, tzModule] = await Promise.all([
    import("all-the-cities"),
    import("tz-lookup"),
  ]);
  lookupTimeZone = (tzModule.default ?? tzModule) as typeof lookupTimeZone;
  const all = (citiesModule.default ?? citiesModule) as GazetteerCity[];
  gazetteer = all.filter((city) => city.population >= MINIMUM_POPULATION);
  return gazetteer;
}

/**
 * Normalises a name for comparison, so "Reykjavik" finds "Reykjavík".
 * @param {string} value - The text to fold
 * @returns {string} The folded text
 */
function fold(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
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
    // Exact, then prefix, then anywhere.
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
 * Sends a concise JSON response from the localhost-only editor middleware.
 * @param {ServerResponse} response - HTTP response
 * @param {number} status - HTTP status code
 * @param {object} body - JSON response body
 * @returns {void}
 */
function sendJson(
  response: ServerResponse,
  status: number,
  body: object,
): void {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
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
          const url = new URL(request.url ?? "", "http://localhost");
          const cities = await loadGazetteer();

          if (url.pathname === "/timezone") {
            const latitude = Number(url.searchParams.get("lat"));
            const longitude = Number(url.searchParams.get("lon"));
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
              sendJson(response, 400, { error: "Invalid coordinates." });
              return;
            }
            sendJson(response, 200, {
              timeZone: lookupTimeZone?.(latitude, longitude) ?? "UTC",
            });
            return;
          }

          const term = (url.searchParams.get("q") ?? "").trim();
          if (term.length < 2) {
            sendJson(response, 200, { matches: [] });
            return;
          }
          const limit = Number(url.searchParams.get("limit")) || DEFAULT_LIMIT;
          sendJson(response, 200, { matches: rank(cities, term, limit) });
        } catch (error) {
          sendJson(response, 500, {
            error:
              error instanceof Error ? error.message : "City lookup failed.",
          });
        }
      });
    },
  };
}
