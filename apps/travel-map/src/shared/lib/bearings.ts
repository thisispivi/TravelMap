import {
  City,
  getCitiesBearing,
  getCitiesDistance,
  Trip,
} from "@travelmap/core";

import { homeCity, visitedTrips } from "@/data/world";

/** One of the eight compass sectors a journey can set off into. */
export type CompassSector = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

/** The eight sectors in clockwise order, starting at true north. */
export const COMPASS_SECTORS: CompassSector[] = [
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
];

const SECTOR_ARC_DEGREES = 360 / COMPASS_SECTORS.length;

/**
 * A journey measured from the place it left: how far out it reached, in which
 * direction, and to where. Every trip in the record departs from and returns to
 * one city, so this is the pair of numbers that describes it most completely.
 * @property {Trip} trip - The journey being described
 * @property {number} bearing - The initial bearing to the furthest stop, in degrees
 * @property {number} distanceKm - The great-circle distance to the furthest stop
 * @property {CompassSector} sector - The compass sector the bearing falls in
 * @property {City | null} furthest - The furthest stayed-in city
 */
export interface Reckoning {
  trip: Trip;
  bearing: number;
  distanceKm: number;
  sector: CompassSector;
  furthest: City | null;
}

/**
 * Resolves the city every journey is measured from. A fork may not name a home
 * city, so the most frequent trip origin stands in before giving up entirely.
 * @returns {City | null} The origin city, or null when the record is empty
 */
export function resolveOrigin(): City | null {
  if (homeCity) return homeCity;

  const counts = new Map<string, { city: City; count: number }>();
  for (const trip of visitedTrips) {
    const city = trip.origin.city;
    const entry = counts.get(city.id) ?? { city, count: 0 };
    entry.count += 1;
    counts.set(city.id, entry);
  }

  let best: { city: City; count: number } | null = null;
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count) best = entry;
  }
  return best?.city ?? null;
}

/**
 * Maps a bearing onto the compass sector whose arc contains it.
 * @param {number} bearing - The bearing in degrees
 * @returns {CompassSector} The containing sector
 */
function getSector(bearing: number): CompassSector {
  const index =
    Math.round(bearing / SECTOR_ARC_DEGREES) % COMPASS_SECTORS.length;
  return COMPASS_SECTORS[index];
}

/**
 * Measures a journey from a reference city.
 * @param {Trip} trip - The journey to measure
 * @param {City} origin - The city the journey is measured from
 * @returns {Reckoning} The journey's bearing, distance, sector and furthest stop
 */
export function reckon(trip: Trip, origin: City): Reckoning {
  const furthest = trip.getFurthestDestinationFrom(origin);
  const bearing = furthest ? getCitiesBearing(origin, furthest) : 0;
  const distanceKm = furthest ? getCitiesDistance(origin, furthest) : 0;
  return { trip, bearing, distanceKm, sector: getSector(bearing), furthest };
}

/**
 * Measures every journey in a list from the same reference city.
 * @param {Trip[]} trips - The journeys to measure
 * @param {City} origin - The city the journeys are measured from
 * @returns {Reckoning[]} One reckoning per journey, in the given order
 */
export function reckonAll(trips: Trip[], origin: City): Reckoning[] {
  return trips.map((trip) => reckon(trip, origin));
}

/**
 * Formats a bearing the way a chart does, zero-padded to three digits so a
 * column of them stays aligned.
 * @param {number} bearing - The bearing in degrees
 * @returns {string} The bearing as a padded degree reading
 */
export function formatBearing(bearing: number): string {
  return `${String(Math.round(bearing) % 360).padStart(3, "0")}°`;
}
