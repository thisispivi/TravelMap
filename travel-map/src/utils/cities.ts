import { flatMap, pipe, sumBy } from "remeda";

import { City } from "../core";
import { visitedTrips } from "../data";
import { getCityTravels } from "./trips";

/**
 * Get total media taken
 * @param {City[]} cities - The list of cities
 * @returns {number} - The total media taken
 */
export function getTotalMediaTaken(cities: City[]): number {
  return pipe(
    cities,
    flatMap((city) => getCityTravels(city, visitedTrips)),
    sumBy((travel) => travel.photos.length),
  );
}
