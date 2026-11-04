import { City, Trip } from "@travelmap/core";
import { unique } from "remeda";

/** What the biggest trips are ranked by. */
export type TripMeasure = "days" | "cities";

/** What the top places are ranked by. */
export type PlaceMeasure = "nights" | "visits" | "photos";

/**
 * A trip's place in a ranking.
 * @property {Trip} trip - The trip
 * @property {number} value - What it scored
 */
export interface RankedTrip {
  trip: Trip;
  value: number;
}

/**
 * A place's place in a ranking.
 * @property {City} city - The place
 * @property {number} value - What it scored
 */
export interface RankedPlace {
  city: City;
  value: number;
}

/**
 * What the place rankings are worked out from.
 * @property {Trip[]} trips - The trips taken
 * @property {City[]} lived - The cities lived in, which do not count as visited
 * @property {(city: City) => number} photosOf - Counts a city's photos
 */
interface PlaceSources {
  trips: Trip[];
  lived: City[];
  photosOf: (city: City) => number;
}

const RANKING_SIZE = 6;

/**
 * Keeps the top of a ranking. The sort is stable and the lists are built in
 * travel order, so a tie goes to what came first; a score of nothing ranks
 * nowhere.
 * @param {T[]} entries - The candidates, oldest first
 * @returns {T[]} The best of them, highest first
 */
function topOf<T extends { value: number }>(entries: T[]): T[] {
  return entries
    .filter(({ value }) => value > 0)
    .toSorted((a, b) => b.value - a.value)
    .slice(0, RANKING_SIZE);
}

/**
 * Ranks the trips by how long they lasted and how many places they saw.
 * @param {Trip[]} trips - The trips taken
 * @returns {Record<TripMeasure, RankedTrip[]>} One ranking per measure
 */
export function getTripRankings(
  trips: Trip[],
): Record<TripMeasure, RankedTrip[]> {
  const byDate = trips.toSorted(
    (a, b) => a.sDate.getTime() - b.sDate.getTime(),
  );

  return {
    cities: topOf(
      byDate.map((trip) => ({ trip, value: unique(trip.route).length })),
    ),
    days: topOf(
      byDate.map((trip) => ({ trip, value: trip.getDurationInDays() })),
    ),
  };
}

/**
 * Ranks the places slept in by the nights spent there, the separate stays, and
 * the photos brought back. One stay is no return, so only a place stayed in
 * twice ranks by visits.
 * @param {PlaceSources} sources - The trips and what else the rankings read
 * @returns {Record<PlaceMeasure, RankedPlace[]>} One ranking per measure
 */
export function getPlaceRankings(
  sources: PlaceSources,
): Record<PlaceMeasure, RankedPlace[]> {
  const { trips, lived, photosOf } = sources;
  const livedIn = new Set(lived);
  const stays = trips
    .toSorted((a, b) => a.sDate.getTime() - b.sDate.getTime())
    .flatMap((trip) => trip.stays)
    .filter(({ city }) => !livedIn.has(city));
  const cities = unique(stays.map(({ city }) => city));

  return {
    nights: topOf(
      cities.map((city) => ({
        city,
        value: stays
          .filter((stay) => stay.city === city)
          .reduce((sum, stay) => sum + stay.nights, 0),
      })),
    ),
    photos: topOf(cities.map((city) => ({ city, value: photosOf(city) }))),
    visits: topOf(
      cities.flatMap((city) => {
        const value = stays.filter((stay) => stay.city === city).length;
        return value > 1 ? [{ city, value }] : [];
      }),
    ),
  };
}
