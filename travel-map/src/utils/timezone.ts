import { firstBy, pipe } from "remeda";
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
