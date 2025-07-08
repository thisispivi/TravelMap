import { filter, firstBy, pipe, uniqueBy } from "remeda";
import { City } from "../core";
import { parameters } from "./parameters";

/**
 * Get the City with the biggest timezone jump.
 * @param {City[]} countries - The list of countries
 * @returns {City | undefined} - The City with the biggest timezone jump
 */
export function getCityBiggestTimezoneJump(
  countries: City[],
): City | undefined {
  const initialTimezone = parameters.birthCity.timezoneGMT;
  return pipe(
    countries,
    firstBy((city) => -Math.abs(city.timezoneGMT - initialTimezone)),
  );
}

/**
 * Get the number of timezones jumped.
 * @param {City[]} countries - The list of countries
 * @returns {number} - The number of timezones jumped
 */
export function getNumberOfTimezonesJumped(countries: City[]): number {
  const initialTimezone = parameters.birthCity.timezoneGMT;
  return pipe(
    filter(countries, (city) => city.timezoneGMT !== initialTimezone),
    uniqueBy((city) => city.timezoneGMT),
  ).length;
}
