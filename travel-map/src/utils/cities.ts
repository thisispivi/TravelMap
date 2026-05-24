import { flatMap, pipe, sumBy } from "remeda";

import { City } from "../core";

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
