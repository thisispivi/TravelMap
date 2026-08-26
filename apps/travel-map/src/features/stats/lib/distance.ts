import { City, getCitiesDistance } from "@travelmap/core";
import { firstBy } from "remeda";

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
 * Represents a transport with distance.
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
