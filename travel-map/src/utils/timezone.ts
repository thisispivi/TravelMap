import { filter, firstBy, pipe, uniqueBy } from "remeda";

import { City } from "../core";
import { visitedTrips } from "../data";
import { parameters } from "./parameters";
import { getCityOffsetMinutesOnDate } from "./timezoneOffset";
import { getCityTravels } from "./trips";

const DEFAULT_LOCALE = "en-US";

/**
 * Get the City with the biggest timezone jump. In case of a tie, the one with the biggest population is returned.
 * @param {City[]} countries - The list of countries
 * @returns {City | undefined} - The City with the biggest timezone jump
 */
export function getCityBiggestTimezoneJump(
  countries: City[],
): City | undefined {
  const birthCity = parameters.birthCity;
  return pipe(
    countries,
    firstBy(
      (city) => {
        const referenceDate =
          getCityTravels(city, visitedTrips)[0]?.sDate ?? new Date();
        const cityOffset = getCityOffsetMinutesOnDate(
          DEFAULT_LOCALE,
          city,
          referenceDate,
        );
        const birthOffset = getCityOffsetMinutesOnDate(
          DEFAULT_LOCALE,
          birthCity,
          referenceDate,
        );
        return -Math.abs(cityOffset - birthOffset);
      },
      (city) => -(city.population ?? 0),
    ),
  );
}

/**
 * Get the number of timezones jumped.
 * @param {City[]} countries - The list of countries
 * @returns {number} - The number of timezones jumped
 */
export function getNumberOfTimezonesJumped(countries: City[]): number {
  const birthCity = parameters.birthCity;
  return pipe(
    filter(countries, (city) => {
      const referenceDate =
        getCityTravels(city, visitedTrips)[0]?.sDate ?? new Date();
      const cityOffset = getCityOffsetMinutesOnDate(
        DEFAULT_LOCALE,
        city,
        referenceDate,
      );
      const birthOffset = getCityOffsetMinutesOnDate(
        DEFAULT_LOCALE,
        birthCity,
        referenceDate,
      );
      return cityOffset !== birthOffset;
    }),
    uniqueBy((city) => {
      const referenceDate =
        getCityTravels(city, visitedTrips)[0]?.sDate ?? new Date();
      return getCityOffsetMinutesOnDate(DEFAULT_LOCALE, city, referenceDate);
    }),
  ).length;
}
