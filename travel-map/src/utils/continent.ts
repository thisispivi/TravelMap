import { City, Continent, Country } from "../core";
import { pipe, map, unique } from "remeda";

/**
 * Get the continents by cities.
 * @param {City[]} cities - The list of cities
 * @returns {Continent[]} - The list of continents
 */
export function getContinentsByCities(cities: City[]): Continent[] {
  return pipe(
    cities,
    map((city) => city.country.continent),
    unique()
  ) as Continent[];
}

/**
 * Get the continent stats.
 * @param {Continent} continent - The continent
 * @param {City[]} cities - The list of cities
 * @param {Country[]} countries - The list of countries
 * @returns {{ continent: Continent; countries: number; cities: number }} - The continent stats
 */
export function getContinentStats(
  continent: Continent,
  cities: City[],
  countries: Country[]
): { continent: Continent; countries: number; cities: number } {
  const numberOfCities = cities.filter(
    (city) => city.country.continent === continent
  ).length;

  const numberOfCountries = countries.filter(
    (country) => country.continent === continent
  ).length;

  return {
    continent,
    countries: numberOfCountries,
    cities: numberOfCities,
  };
}
