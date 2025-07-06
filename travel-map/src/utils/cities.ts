import { pipe, filter, flatMap, sumBy } from "remeda";
import { City, Country } from "../core";

type GetCitiesByCountriesAndIsFuture = {
  countries: Country[];
  cities: City[];
  isFuture: boolean;
};

/**
 * Get cities filtered by countries and travel status (future/past).
 * @param {GetCitiesByCountriesAndIsFuture} data - The data to filter by.
 * @param {City[]} data.cities - The list of cities to filter.
 * @param {Country[]} data.countries - The list of countries to filter by.
 * @param {boolean} data.isFuture - Whether to filter for future travels.
 * @returns {City[]} - The filtered cities.
 */
export function getCitiesByCountriesAndIsFuture({
  countries,
  cities,
  isFuture,
}: GetCitiesByCountriesAndIsFuture): City[] {
  return pipe(
    countries,
    flatMap((country) =>
      pipe(
        cities,
        filter(
          (city) =>
            city.country.id === country.id &&
            city.travels.some((travel) => travel.isFuture === isFuture),
        ),
        flatMap((city) =>
          city.travels
            .filter((travel) => travel.isFuture === isFuture)
            .map((travel) => new City({ ...city, travels: [travel] })),
        ),
      ),
    ),
  );
}

/**
 * Sort by travel start date
 * @param {City} a - The first city
 * @param {City} b - The second city
 * @returns {number} - The comparison result
 */
export function sortByTravelStartDate(a: City, b: City): number {
  const aDate = a.travels[0].sDate;
  const bDate = b.travels[0].sDate;
  return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
}

/**
 * Get total media taken
 * @param {City[]} cities - The list of cities
 * @returns {number} - The total media taken
 */
export function getTotalMediaTaken(cities: City[]): number {
  return pipe(
    cities,
    flatMap((city) => city.travels),
    sumBy((travel) => travel.photos.length),
  );
}
