import { City } from "../classes/City";
import { Country } from "../classes/Country";
import { Trip, TripRouteStep } from "../classes/Trip";
import { CityJson, CountryJson, TripJson } from "../schema";
import { FerryCompany } from "../typings/FerryCompany";
import { FlightCompany } from "../typings/FlightCompany";
import { Image } from "../typings/Image";
import { parseLocalDate } from "./date";

/**
 * Raw JSON modules supplied by an app-owned import.meta.glob call.
 * @property {CountryJson[]} countries - Countries in the dataset
 * @property {CityJson[]} cities - Cities in the dataset
 * @property {TripJson[]} trips - Trips in the dataset
 * @property {Record<string, Image[]>} photos - Photo manifests keyed by photoPath
 * @property {string | null} [homeCityId] - Optional home city reference
 * @property {string[]} [livedCityIds] - Former-home city references
 * @property {string[]} [futureCityIds] - Planned city references
 */
export interface WorldSources {
  countries: CountryJson[];
  cities: CityJson[];
  trips: TripJson[];
  photos: Record<string, Image[]>;
  homeCityId?: string | null;
  livedCityIds?: string[];
  futureCityIds?: string[];
}

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

/**
 * Builds one shared graph so all trip references retain object identity.
 * @param {WorldSources} sources - JSON modules loaded by an app
 * @returns {World} The resolved world
 */
export function buildWorld(sources: WorldSources): World {
  const countriesById = new Map(
    sources.countries.map((data) => [data.id, new Country(data)]),
  );
  const citiesById = new Map(
    sources.cities.map((data) => [
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
  const trips = sources.trips
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
                    ? (sources.photos[step.photoPath] ?? [])
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
                  flight: step.flight
                    ? {
                        ...step.flight,
                        company: step.flight.company as
                          FlightCompany | undefined,
                      }
                    : undefined,
                  ferry: step.ferry
                    ? {
                        ...step.ferry,
                        company: step.ferry.company as FerryCompany | undefined,
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
        ...resolveCities(sources.livedCityIds),
      ].map((city) => [city.id, city]),
    ).values(),
  );

  return {
    countriesById,
    citiesById,
    trips,
    livedCities,
    futureCities: resolveCities(sources.futureCityIds),
    homeCity: sources.homeCityId
      ? requireReference(citiesById, sources.homeCityId, "config")
      : null,
  };
}
