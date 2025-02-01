import { filter, firstBy, pipe, uniqueBy } from "remeda";
import { Country } from "../core";
import { parameters } from "./parameters";

/**
 * Get the country with the biggest timezone jump.
 * @param {Country[]} countries - The list of countries
 * @returns {Country | undefined} - The country with the biggest timezone jump
 */
export function getCountryBiggestTimezoneJump(
  countries: Country[],
): Country | undefined {
  const initialTimezone = parameters.birthCity.country.timezoneGMT;
  return pipe(
    countries,
    firstBy((country) => -Math.abs(country.timezoneGMT - initialTimezone)),
  );
}

/**
 * Get the number of timezones jumped.
 * @param {Country[]} countries - The list of countries
 * @returns {number} - The number of timezones jumped
 */
export function getNumberOfTimezonesJumped(countries: Country[]): number {
  const initialTimezone = parameters.birthCity.country.timezoneGMT;
  return pipe(
    filter(countries, (country) => country.timezoneGMT !== initialTimezone),
    uniqueBy((country) => country.timezoneGMT),
  ).length;
}
