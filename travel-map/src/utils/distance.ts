import { firstBy, sumBy } from "remeda";
import { City } from "../core";
import { Flight } from "../core/classes/Flight";
import { toRadians } from "./convert";

/**
 * Get the haversine distance between two points.
 * @param {{ lat: number; lon: number }} start - The start point
 * @param {{ lat: number; lon: number }} end - The end point
 * @returns {number} - The distance between the two points in kilometers
 */
export function haversineDistance(
  start: { lat: number; lon: number },
  end: { lat: number; lon: number },
): number {
  const RADIUS_EARTH_KM = 6371;

  // Convert degrees to radians
  const dLat = toRadians(end.lat - start.lat);
  const dLon = toRadians(end.lon - start.lon);
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);

  // Haversine formula
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
 * @returns {number} - The distance between the two cities in kilometers
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
 * @returns {{ furthest: City; nearest: City }} - The furthest and nearest cities
 */
export function getFurthestAndNearestCity(
  cities: City[],
  referenceCity: City,
): { furthest: City; nearest: City } {
  const distances = cities.map((city) => ({
    distance: getCitiesDistance(city, referenceCity),
    city,
  }));

  return {
    furthest: firstBy(distances, (d) => -d.distance)!.city,
    nearest: firstBy(distances, (d) => d.distance)!.city,
  };
}

/**
 * Get the minimum and maximum flights from a list of flights.
 * @param {Flight[]} takenFlights - The list of flights
 * @returns {{ min: Flight; max: Flight }} - The minimum and maximum flights
 */
export function getMinAndMaxFlight(takenFlights: Flight[]): {
  min: Flight;
  max: Flight;
} {
  return {
    min: firstBy(takenFlights, (f) => f.distanceInKm)!,
    max: firstBy(takenFlights, (f) => -f.distanceInKm)!,
  };
}

/**
 * Get the total mileage from a list of flights.
 * @param {Flight[]} takenFlights - The list of flights
 * @returns {string} - The total mileage in kilometers
 */
export function getTotalMileage(takenFlights: Flight[]): number {
  return sumBy(takenFlights, (f) => f.distanceInKm);
}
