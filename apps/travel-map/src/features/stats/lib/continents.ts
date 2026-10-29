import { City, Continent, Country } from "@travelmap/core";

/**
 * Counts how many visited countries and cities fall on one continent.
 * @param {Continent} continent - The continent to count for
 * @param {City[]} cities - The list of cities
 * @param {Country[]} countries - The list of countries
 * @returns {{ continent: Continent; countries: number; cities: number }} The continent stats
 */
export function getContinentStats(
  continent: Continent,
  cities: City[],
  countries: Country[],
): { continent: Continent; countries: number; cities: number } {
  const numberOfCities = cities.filter(
    (city) => city.country.continent === continent,
  ).length;

  const numberOfCountries = countries.filter(
    (country) => country.continent === continent,
  ).length;

  return {
    continent,
    countries: numberOfCountries,
    cities: numberOfCities,
  };
}
