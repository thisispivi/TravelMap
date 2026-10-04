import { City, getCitiesDistance } from "@travelmap/core";
import type { Ferry } from "@travelmap/core/classes/Ferry";
import type { Flight } from "@travelmap/core/classes/Flight";
import { firstBy, sumBy } from "remeda";

/**
 * Get the furthest and nearest cities from a reference city.
 * @param {City[]} cities - The list of cities
 * @param {City} referenceCity - The reference city
 * @returns {{ furthest: City; nearest: City } | undefined} The furthest and nearest cities, or undefined when there are none
 */
export function getFurthestAndNearestCity(
  cities: City[],
  referenceCity: City,
): { furthest: City; nearest: City } | undefined {
  if (cities.length === 0) return undefined;

  const distances: { city: City; distance: number }[] = [];
  for (const city of cities) {
    if (city.id === referenceCity.id) continue;
    distances.push({
      distance: getCitiesDistance(city, referenceCity),
      city,
    });
  }
  if (distances.length === 0) return undefined;

  return {
    furthest: firstBy(distances, (d) => -d.distance)!.city,
    nearest: firstBy(distances, (d) => d.distance)!.city,
  };
}

/**
 * Anything with a length, such as a flight or a ferry crossing.
 * @property {number} distanceInKm - The distance in km
 */
type TransportWithDistance = { distanceInKm: number };

/**
 * Get the minimum and maximum transports from a list of transports.
 * @param {T[]} transports - The list of transports
 * @returns {{ min: T; max: T } | undefined} The minimum and maximum transports
 */
export function getMinAndMaxTransport<T extends TransportWithDistance>(
  transports: T[],
): { min: T; max: T } | undefined {
  if (transports.length === 0) return;

  return {
    min: firstBy(transports, (t) => t.distanceInKm)!,
    max: firstBy(transports, (t) => -t.distanceInKm)!,
  };
}

/**
 * Get the total mileage from a list of flights.
 * @param {Flight[]} takenFlights - The list of flights
 * @param {Ferry[]} takenFerries - The list of ferries
 * @returns {string} The total mileage in kilometers
 */
export function getTotalMileage(
  takenFlights: Flight[],
  takenFerries: Ferry[],
): number {
  return (
    sumBy(takenFlights, (f) => f.distanceInKm) +
    sumBy(takenFerries, (f) => f.distanceInKm)
  );
}
