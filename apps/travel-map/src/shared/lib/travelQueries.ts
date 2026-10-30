import { City, Travel, Trip } from "@travelmap/core";

/**
 * Returns every travel entry for a city in chronological order.
 * @param {City} city - The city whose travels should be collected
 * @param {Trip[]} trips - The trips to search
 * @returns {Travel[]} The city's chronological travel entries
 */
export function getCityTravels(city: City, trips: Trip[]): Travel[] {
  return trips
    .flatMap((trip) => trip.getCityTravels(city))
    .sort((first, second) => first.sDate.getTime() - second.sDate.getTime());
}
