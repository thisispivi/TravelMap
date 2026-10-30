import { CityJson, tripPlaceIds } from "@travelmap/core";

import type { DatasetSnapshot } from "../../../data/store";
import { searchItems } from "../../library/lib/search";

/**
 * One country's places, for the list.
 * @property {string} countryId - The country id
 * @property {string} name - The country's name
 * @property {CityJson[]} cities - Its cities, by name
 */
export interface CountryGroup {
  countryId: string;
  name: string;
  cities: CityJson[];
}

/**
 * Groups the cities that match the search by country, both by name, so the
 * list reads as the site's Places tab does.
 * @param {DatasetSnapshot} dataset - The dataset
 * @param {string} query - What was typed in the search
 * @returns {CountryGroup[]} The countries with at least one matching city
 */
export function groupCities(
  dataset: DatasetSnapshot,
  query: string,
): CountryGroup[] {
  const names = new Map(
    dataset.countries.map(({ value }) => [value.id, value.name]),
  );
  const matching = searchItems(
    dataset.cities.map(({ value }) => value),
    query,
    (city) => [city.name, names.get(city.countryId) ?? city.countryId],
  );
  const groups = new Map<string, CountryGroup>();
  for (const city of matching) {
    const group = groups.get(city.countryId) ?? {
      cities: [],
      countryId: city.countryId,
      name: names.get(city.countryId) ?? city.countryId,
    };
    group.cities.push(city);
    groups.set(city.countryId, group);
  }
  return [...groups.values()]
    .toSorted((first, second) => first.name.localeCompare(second.name))
    .map((group) => ({
      ...group,
      cities: group.cities.toSorted((first, second) =>
        first.name.localeCompare(second.name),
      ),
    }));
}

/**
 * Counts, for every place, how many trips reach it, a trip that passes a place
 * twice counting once.
 * @param {DatasetSnapshot} dataset - The dataset
 * @returns {Map<string, number>} Trips by city id
 */
export function countTripsByPlace(
  dataset: DatasetSnapshot,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const { value } of dataset.trips)
    for (const id of new Set(tripPlaceIds(value)))
      counts.set(id, (counts.get(id) ?? 0) + 1);
  return counts;
}
