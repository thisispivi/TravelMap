import { City, Trip } from "@travelmap/core";

import { getCityTravels } from "@/shared/lib/travelQueries";

/**
 * A city paired with how many separate times it was stayed in.
 * @property {City} city - The city
 * @property {number} visits - How many separate travels stayed in it
 */
export interface CityVisits {
  city: City;
  visits: number;
}

/**
 * Counts how many separate travels stayed in each city. The places grid uses
 * the result to give a returned-to city a wider plate than a place seen once,
 * so the grid's rhythm reports something about the trips rather than tiling
 * every city identically.
 * @param {City[]} cities - The cities to count visits for
 * @param {Trip[]} trips - The trips to read travels from
 * @returns {CityVisits[]} Each city with its visit count, input order preserved
 */
export function countCityVisits(cities: City[], trips: Trip[]): CityVisits[] {
  return cities.map((city) => ({
    city,
    visits: getCityTravels(city, trips).length,
  }));
}
