import type { City } from "@travelmap/core/classes/City";
import type { Ferry } from "@travelmap/core/classes/Ferry";
import type { Flight } from "@travelmap/core/classes/Flight";
import { firstBy, sumBy } from "remeda";

import { toRadians } from "./convert";

/**
 * Get the haversine distance between two points.
 * @param {{ lat: number; lon: number }} start - The start point
 * @param {number} start.lat - The start latitude
 * @param {number} start.lon - The start longitude
 * @param {{ lat: number; lon: number }} end - The end point
 * @param {number} end.lat - The end latitude
 * @param {number} end.lon - The end longitude
 * @returns {number} The distance between the two points in kilometers
 */
function haversineDistance(
  start: { lat: number; lon: number },
  end: { lat: number; lon: number },
): number {
  const RADIUS_EARTH_KM = 6371;
  const dLat = toRadians(end.lat - start.lat);
  const dLon = toRadians(end.lon - start.lon);
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RADIUS_EARTH_KM * c;
}

/**
 * Get the distance between two cities.
 * @param {City} start - The start city
 * @param {City} end - The end city
 * @returns {number} The distance between the two cities in kilometers
 */
export function getCitiesDistance(start: City, end: City): number {
  return haversineDistance(
    start.getCoordinatesAsLatLon(),
    end.getCoordinatesAsLatLon(),
  );
}

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
