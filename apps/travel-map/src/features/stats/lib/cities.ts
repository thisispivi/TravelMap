import { City } from "@travelmap/core";
import { flatMap, pipe, sumBy } from "remeda";

import { visitedTrips } from "@/data/world";
import { getCityTravels } from "@/shared/lib/travelQueries";

/**
 * Get total media taken
 * @param {City[]} cities - The list of cities
 * @returns {number} The total media taken
 */
export function getTotalMediaTaken(cities: City[]): number {
  return pipe(
    cities,
    flatMap((city) => getCityTravels(city, visitedTrips)),
    sumBy((travel) => travel.photos.length),
  );
}
