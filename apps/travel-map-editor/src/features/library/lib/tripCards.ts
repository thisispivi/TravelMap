import { CityJson, TripJson } from "@travelmap/core";

import { DataFile } from "../../../data/store";

/**
 * Trips displayed beneath one calendar year.
 * @property {string | null} year - Four-digit year, or null for an undated draft
 * @property {DataFile<TripJson>[]} trips - Trips ordered newest first
 */
export interface TripYearGroup {
  year: string | null;
  trips: DataFile<TripJson>[];
}

/**
 * Groups trips by their authored start year for the home-page archive.
 * @param {DataFile<TripJson>[]} trips - Trip documents
 * @returns {TripYearGroup[]} Newest years first, followed by undated drafts
 */
export function groupTripsByYear(trips: DataFile<TripJson>[]): TripYearGroup[] {
  const groups = new Map<string | null, DataFile<TripJson>[]>();
  for (const trip of trips.toSorted((first, second) =>
    second.value.sDate.localeCompare(first.value.sDate),
  )) {
    const year = /^\d{4}/.exec(trip.value.sDate)?.[0] ?? null;
    groups.set(year, [...(groups.get(year) ?? []), trip]);
  }
  return Array.from(groups, ([year, groupedTrips]) => ({
    trips: groupedTrips,
    year,
  })).sort((first, second) => {
    if (first.year === null) return 1;
    if (second.year === null) return -1;
    return second.year.localeCompare(first.year);
  });
}

/**
 * Returns the countries visited by one trip in itinerary order, ignoring
 * layovers and duplicates.
 * @param {TripJson} trip - Trip document
 * @param {Map<string, CityJson>} cities - Cities indexed by identifier
 * @returns {string[]} Country identifiers
 */
export function tripCountryIds(
  trip: TripJson,
  cities: Map<string, CityJson>,
): string[] {
  return Array.from(
    new Set(
      trip.steps.flatMap((step) => {
        if (step.type !== "stop" || step.isLayover) return [];
        const countryId = cities.get(step.cityId)?.countryId;
        return countryId ? [countryId] : [];
      }),
    ),
  );
}

/**
 * Collects the text a trip should be findable by. Stop cities and countries are
 * included because an author looks for "Japan" far more often than for the trip
 * title they gave it.
 * @param {TripJson} trip - Trip document
 * @param {Map<string, CityJson>} cities - Cities indexed by identifier
 * @returns {string[]} Searchable terms for the trip
 */
export function tripSearchTerms(
  trip: TripJson,
  cities: Map<string, CityJson>,
): string[] {
  const stopCities = trip.steps.flatMap((step) =>
    step.type === "stop" ? [cities.get(step.cityId)] : [],
  );
  return [
    trip.id,
    trip.title,
    trip.sDate,
    ...Object.values(trip.titleByLocale ?? {}),
    ...stopCities.flatMap((city) => (city ? [city.name, city.countryId] : [])),
  ];
}

/**
 * Picks the trip's cover, falling back to the first visited city's first image.
 * @param {TripJson} trip - Trip document
 * @param {Map<string, CityJson>} cities - Cities indexed by identifier
 * @returns {string | undefined} An authored CDN-relative media path
 */
export function tripThumbnail(
  trip: TripJson,
  cities: Map<string, CityJson>,
): string | undefined {
  if (trip.coverImage) return trip.coverImage;
  const firstStop = trip.steps.find(
    (step) => step.type === "stop" && !step.isLayover,
  );
  return firstStop?.type === "stop"
    ? cities.get(firstStop.cityId)?.backgroundImages?.[0]
    : undefined;
}
