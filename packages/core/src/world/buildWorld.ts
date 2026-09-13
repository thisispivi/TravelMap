import { City } from "../classes/City";
import { Country } from "../classes/Country";
import { Trip, TripRouteStep } from "../classes/Trip";
import { WorldSourcesSchema } from "../schema";
import { parseLocalDate } from "./date";

/**
 * Resolved domain data shared by the public app and local editor.
 * @property {Map<string, Country>} countriesById - Countries keyed by stable id
 * @property {Map<string, City>} citiesById - Cities keyed by stable id
 * @property {Trip[]} trips - Trips sorted by start date then id
 * @property {City[]} livedCities - Resolved former-home cities
 * @property {City[]} futureCities - Resolved planned cities
 * @property {City | null} homeCity - Resolved home city
 */
export interface World {
  countriesById: Map<string, Country>;
  citiesById: Map<string, City>;
  trips: Trip[];
  livedCities: City[];
  futureCities: City[];
  homeCity: City | null;
}

/**
 * Resolves a reference or throws close to the malformed JSON that introduced it.
 * @param {Map<string, T>} values - Entities keyed by id
 * @param {string} id - Referenced id
 * @param {string} source - JSON source being resolved
 * @returns {T} The resolved entity
 */
function requireReference<T>(
  values: Map<string, T>,
  id: string,
  source: string,
): T {
  const value = values.get(id);
  if (!value) throw new Error(`${source} references unknown id "${id}"`);
  return value;
}

/* Enough detail to find the offending document without a wall of output. */
const REPORTED_ISSUE_LIMIT = 5;

/**
 * Builds one shared graph so all trip references retain object identity.
 * This is the dataset's single trust boundary: callers hand over the raw JSON
 * their bundler loaded and it is validated here, so `sources` is deliberately
 * `unknown` rather than a shape the caller could assert its way into.
 * @param {unknown} sources - Raw JSON modules loaded by an app
 * @returns {World} The resolved world
 */
export function buildWorld(sources: unknown): World {
  const parsed = WorldSourcesSchema.safeParse(sources);
  if (!parsed.success) {
    const { issues } = parsed.error;
    const reported = issues
      .slice(0, REPORTED_ISSUE_LIMIT)
      .map((issue) => `${issue.path.join(".") || "document"}: ${issue.message}`)
      .join("; ");
    const hidden = issues.length - REPORTED_ISSUE_LIMIT;
    throw new Error(
      `Malformed dataset: ${reported}${hidden > 0 ? ` (and ${hidden} more)` : ""}`,
    );
  }

  const countriesById = new Map(
    parsed.data.countries.map((data) => [data.id, new Country(data)]),
  );
  const citiesById = new Map(
    parsed.data.cities.map((data) => [
      data.id,
      new City({
        ...data,
        country: requireReference(
          countriesById,
          data.countryId,
          `city ${data.id}`,
        ),
        backgroundImgSources: data.backgroundImages,
      }),
    ]),
  );
  const trips = parsed.data.trips
    .map(
      (data) =>
        new Trip({
          ...data,
          sDate: parseLocalDate(data.sDate),
          eDate: parseLocalDate(data.eDate),
          origin: {
            city: requireReference(
              citiesById,
              data.originCityId,
              `trip ${data.id}`,
            ),
          },
          returnTo: {
            city: requireReference(
              citiesById,
              data.returnCityId,
              `trip ${data.id}`,
            ),
          },
          steps: data.steps.map((step): TripRouteStep =>
            step.type === "stop"
              ? {
                  ...step,
                  city: requireReference(
                    citiesById,
                    step.cityId,
                    `trip ${data.id}`,
                  ),
                  sDate: parseLocalDate(step.sDate),
                  eDate: parseLocalDate(step.eDate),
                  photos: step.photoPath
                    ? (parsed.data.photos[step.photoPath] ?? [])
                    : undefined,
                }
              : {
                  ...step,
                  from: requireReference(
                    citiesById,
                    step.fromId,
                    `trip ${data.id}`,
                  ),
                  to: requireReference(
                    citiesById,
                    step.toId,
                    `trip ${data.id}`,
                  ),
                  via: step.viaIds?.map((id) =>
                    requireReference(citiesById, id, `trip ${data.id}`),
                  ),
                  sDate: step.sDate ? parseLocalDate(step.sDate) : undefined,
                  eDate: step.eDate ? parseLocalDate(step.eDate) : undefined,
                  flight: step.flight,
                  ferry: step.ferry
                    ? {
                        ...step.ferry,
                        via: step.ferry.viaIds?.map((id) =>
                          requireReference(citiesById, id, `trip ${data.id}`),
                        ),
                      }
                    : undefined,
                },
          ),
        }),
    )
    .sort(
      (a, b) =>
        a.sDate.getTime() - b.sDate.getTime() || a.id.localeCompare(b.id),
    );

  /**
   * Resolves configured city references against the shared city registry.
   * @param {string[]} [ids] - City ids listed in the site configuration
   * @returns {City[]} The resolved cities
   */
  const resolveCities = (ids: string[] = []): City[] =>
    ids.map((id) => requireReference(citiesById, id, "config"));
  const livedCities = Array.from(
    new Map(
      [
        ...Array.from(citiesById.values()).filter((city) => city.isLived),
        ...resolveCities(parsed.data.livedCityIds),
      ].map((city) => [city.id, city]),
    ).values(),
  );

  return {
    countriesById,
    citiesById,
    trips,
    livedCities,
    futureCities: resolveCities(parsed.data.futureCityIds),
    homeCity: parsed.data.homeCityId
      ? requireReference(citiesById, parsed.data.homeCityId, "config")
      : null,
  };
}
