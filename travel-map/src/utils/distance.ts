import { City } from "../core";
import { Flight } from "../core/classes/Flight";

/**
 * Calculate the distance between two points on the Earth's surface using the Haversine formula.
 * @param {number} lat1 - The latitude of the first point
 * @param {number} lon1 - The longitude of the first point
 * @param {number} lat2 - The latitude of the second point
 * @param {number} lon2 - The longitude of the second point
 * @returns {number} - The distance between the two points in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Get the distance between two cities.
 * @param {City} city1 - The first city
 * @param {City} city2 - The second city
 * @returns {number} - The distance between the two cities in kilometers
 */
export function getCitiesDistance(city1: City, city2: City): number {
  return haversineDistance(
    city1.coordinates[1],
    city1.coordinates[0],
    city2.coordinates[1],
    city2.coordinates[0],
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
    furthest: distances.reduce((prev, current) =>
      prev.distance > current.distance ? prev : current,
    ).city,
    nearest: distances.reduce((prev, current) =>
      prev.distance < current.distance ? prev : current,
    ).city,
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
    min: takenFlights.reduce((prev, current) =>
      prev.distanceInKm < current.distanceInKm ? prev : current,
    ),
    max: takenFlights.reduce((prev, current) =>
      prev.distanceInKm > current.distanceInKm ? prev : current,
    ),
  };
}

/**
 * Get the total mileage from a list of flights.
 * @param {Flight[]} takenFlights - The list of flights
 * @returns {string} - The total mileage in kilometers
 */
export function getTotalMileage(takenFlights: Flight[]): string {
  return takenFlights
    .reduce((prev, current) => prev + current.distanceInKm, 0)
    .toFixed(2);
}
