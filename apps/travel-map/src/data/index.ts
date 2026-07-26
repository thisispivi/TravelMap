import {
  buildWorld,
  City,
  CityJson,
  Country,
  CountryJson,
  Ferry,
  Image,
  Trip,
  TripJson,
} from "@travelmap/core";
import { unique } from "remeda";

/**
 * Serializable site settings consumed by the public app.
 * @property {string | null} [homeCityId] - Optional home city id
 * @property {string[]} [livedCityIds] - Former-home city ids
 * @property {string[]} [futureCityIds] - Planned city ids
 * @property {{ defaultZoom: number; defaultMinZoom: number; defaultMaxZoom: number; defaultCenter: [number, number]; hoveredCityZoom: number; marker: { defaultScale: number; minScale: number; maxScale: number } }} [map] - Map configuration
 * @property {{ groupByCitiesCutoffYear: number }} [trips] - Trip display settings
 * @property {Record<string, string[]>} [unescoSites] - Authored UNESCO sites
 * @property {Record<string, { name: string; logo?: string }>} [companies] - Transport company metadata
 */
interface SiteConfig {
  homeCityId?: string | null;
  livedCityIds?: string[];
  futureCityIds?: string[];
  map?: {
    defaultZoom: number;
    defaultMinZoom: number;
    defaultMaxZoom: number;
    defaultCenter: [number, number];
    hoveredCityZoom: number;
    marker: { defaultScale: number; minScale: number; maxScale: number };
  };
  trips?: { groupByCitiesCutoffYear: number };
  unescoSites?: Record<string, string[]>;
  companies?: Record<string, { name: string; logo?: string }>;
}

/**
 * Extracts eagerly bundled JSON values from Vite's module map.
 * @param {Record<string, { default: T }>} modules - Modules returned by Vite
 * @returns {T[]} Their JSON default exports
 */
function values<T>(modules: Record<string, { default: T }>): T[] {
  return Object.values(modules).map(({ default: value }) => value);
}

const countries = values<CountryJson>(
  import.meta.glob(
    ["../../../../data/*/*.json", "!../../../../data/trips/*.json"],
    { eager: true },
  ),
);
const cities = values<CityJson>(
  import.meta.glob("../../../../data/*/*/*.json", { eager: true }),
);
const trips = values<TripJson>(
  import.meta.glob("../../../../data/trips/*.json", { eager: true }),
);
const config = import.meta.glob<{ default: SiteConfig }>(
  "../../../../data/site.config.json",
  { eager: true },
);
const photoModules = import.meta.glob<{ default: Image[] }>(
  "../../../../data/photos/**/*.json",
  { eager: true },
);
const photos = Object.fromEntries(
  Object.entries(photoModules).map(([path, { default: images }]) => [
    path.replace(/^.*\/data\/photos\//, "").replace(/\.json$/, ""),
    images,
  ]),
);

const worldConfig = Object.values(config)[0]?.default;
const world = buildWorld({
  countries,
  cities,
  futureCityIds: worldConfig?.futureCityIds,
  homeCityId: worldConfig?.homeCityId,
  livedCityIds: worldConfig?.livedCityIds,
  photos,
  trips,
});

export const visitedTrips: Trip[] = world.trips;
export const livedCities: City[] = world.livedCities;
export const futureCities: City[] = world.futureCities;
export const homeCity: City | null = world.homeCity;
export const visitedCities: City[] = unique(
  visitedTrips.flatMap((trip) =>
    trip.destinations.flatMap((destination) =>
      destination.isLayover ? [] : [destination.city],
    ),
  ),
).sort((first, second) => first.name.localeCompare(second.name));
export const visitedCountries: Country[] = unique(
  visitedCities.map((city) => city.country),
).sort((first, second) => first.id.localeCompare(second.id));
export const takenFlights = visitedTrips.flatMap((trip) => trip.getFlights());
export const takenFerries: Ferry[] = visitedTrips.flatMap((trip) =>
  trip.getFerries().flatMap((ferry) => (ferry.company ? [ferry] : [])),
);
export const siteConfig = worldConfig;
