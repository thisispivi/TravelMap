import { firstBy, sumBy } from "remeda";

import { Ferry } from "@/core/classes/Ferry";

import { City } from "../core";
import { Flight } from "../core";
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

type TransportWithDistance = { distanceInKm: number };

/**
 * Get the minimum and maximum transports from a list of transports.
 * @param {T[]} transports - The list of transports
 * @returns {{ min: T; max: T }} - The minimum and maximum transports
 */
export function getMinAndMaxTransport<T extends TransportWithDistance>(
  transports: T[],
): { min: T; max: T } {
  if (transports.length === 0)
    throw new Error("getMinAndMaxTransport: transports must not be empty");

  return {
    min: firstBy(transports, (t) => t.distanceInKm)!,
    max: firstBy(transports, (t) => -t.distanceInKm)!,
  };
}

/**
 * Get the total mileage from a list of flights.
 * @param {Flight[]} takenFlights - The list of flights
 * @param {Ferry[]} takenFerries - The list of ferries
 * @returns {string} - The total mileage in kilometers
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
