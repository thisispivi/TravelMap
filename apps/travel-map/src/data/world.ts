import {
  buildWorld,
  City,
  Country,
  Ferry,
  SiteConfig,
  SiteConfigSchema,
  Trip,
} from "@travelmap/core";
import { partition, unique } from "remeda";

/**
 * Extracts eagerly bundled JSON values from Vite's module map.
 * @param {Record<string, { default: unknown }>} modules - Modules returned by Vite
 * @returns {unknown[]} Their JSON default exports
 */
function values(modules: Record<string, { default: unknown }>): unknown[] {
  return Object.values(modules).map(({ default: value }) => value);
}

/*
 * `data/` is authored by hand and by the editor, so it is validated rather than
 * trusted — but only once, by `buildWorld`, which owns the dataset contract.
 * The globs below deliberately hand over raw JSON.
 */
const countries = values(
  import.meta.glob("../../../../data/cities/*/*.json", { eager: true }),
);
const cities = values(
  import.meta.glob("../../../../data/cities/*/*/*.json", { eager: true }),
);
const trips = values(
  import.meta.glob("../../../../data/trips/*.json", { eager: true }),
);
const config = import.meta.glob<{ default: unknown }>(
  "../../../../data/site.config.json",
  { eager: true },
);
const photoModules = import.meta.glob<{ default: unknown }>(
  "../../../../data/photos/**/*.json",
  { eager: true },
);
const photos = Object.fromEntries(
  Object.entries(photoModules).map(([path, { default: images }]) => [
    path.replace(/^.*\/data\/photos\//, "").replace(/\.json$/, ""),
    images,
  ]),
);

const rawWorldConfig = Object.values(config)[0]?.default;
const worldConfig: SiteConfig | undefined = rawWorldConfig
  ? SiteConfigSchema.parse(rawWorldConfig)
  : undefined;
const world = buildWorld({
  countries,
  cities,
  futureCityIds: worldConfig?.futureCityIds,
  homeCityId: worldConfig?.homeCityId,
  livedCityIds: worldConfig?.livedCityIds,
  photos,
  trips,
});

/*
 * Planned travel is split off here rather than filtered at each call site, so
 * every downstream total — trips, statistics, visited places — describes
 * journeys that already happened without each feature repeating the rule.
 */
const [plannedTrips, takenTrips] = partition(world.trips, (trip) =>
  trip.isFuture(),
);

export const visitedTrips: Trip[] = takenTrips;
export const futureTrips: Trip[] = plannedTrips;
export const livedCities: City[] = world.livedCities;
export const homeCity: City | null = world.homeCity;

/**
 * Collects the cities a trip actually stays in. Layovers are excluded because
 * passing through an airport is not visiting a place, and the origin and return
 * cities are excluded because they describe where a journey began rather than
 * somewhere it went.
 * @param {Trip[]} trips - The trips to read stops from
 * @returns {City[]} Every stayed-in city, with duplicates removed
 */
function stayedInCities(trips: Trip[]): City[] {
  return unique(
    trips.flatMap((trip) =>
      trip.destinations.flatMap((destination) =>
        destination.isLayover ? [] : [destination.city],
      ),
    ),
  );
}

/* Lived-in cities are their own category and must not inflate visited totals. */
const livedCityIds = new Set(livedCities.map((city) => city.id));

export const visitedCities: City[] = stayedInCities(visitedTrips)
  .filter((city) => !livedCityIds.has(city.id))
  .sort((first, second) => first.name.localeCompare(second.name));
export const futureCities: City[] = unique([
  ...world.futureCities,
  ...stayedInCities(futureTrips),
]).sort((first, second) => first.name.localeCompare(second.name));
export const visitedCountries: Country[] = unique(
  visitedCities.map((city) => city.country),
).sort((first, second) => first.id.localeCompare(second.id));
export const takenFlights = visitedTrips.flatMap((trip) => trip.getFlights());
export const takenFerries: Ferry[] = visitedTrips.flatMap((trip) =>
  trip.getFerries().flatMap((ferry) => (ferry.company ? [ferry] : [])),
);
export const siteConfig = worldConfig;
