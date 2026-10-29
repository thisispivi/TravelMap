import { Trip } from "@travelmap/core";

import { futureTrips, visitedTrips } from "@/data/world";
import { env } from "@/shared/lib/env";

/*
 * A trip still under way is left out until it ends, so the list never shows
 * an itinerary that is only half true. Planned trips can be previewed in
 * development.
 */
const SHOW_FUTURE_TRIPS = env.DEV && env.VITE_SHOW_FUTURE_TRIPS;

/**
 * Reports whether a trip ends after today.
 * @param {Trip} trip - The trip
 * @param {Date} today - The reference day
 * @returns {boolean} Whether its last day is still ahead
 */
function endsAfter(trip: Trip, today: Date): boolean {
  const end = new Date(trip.eDate);
  end.setHours(0, 0, 0, 0);
  const day = new Date(today);
  day.setHours(0, 0, 0, 0);
  return end.getTime() > day.getTime();
}

/** The trips the list shows. */
export const browsableTrips: Trip[] = [...visitedTrips, ...futureTrips].filter(
  (trip) => SHOW_FUTURE_TRIPS || !endsAfter(trip, new Date()),
);

/**
 * The trips that started in one year.
 * @property {number} year - The year
 * @property {Trip[]} trips - Its trips, newest first
 */
export interface TripYear {
  year: number;
  trips: Trip[];
}

/**
 * Groups trips by the year they started, newest year and newest trip first.
 * @param {Trip[]} trips - The trips
 * @returns {TripYear[]} One group per year with a trip
 */
export function groupByYear(trips: Trip[]): TripYear[] {
  const years: TripYear[] = [];
  for (const trip of trips.toSorted(
    (first, second) => second.sDate.getTime() - first.sDate.getTime(),
  )) {
    const year = trip.sDate.getFullYear();
    const current = years.at(-1);
    if (current?.year === year) current.trips.push(trip);
    else years.push({ trips: [trip], year });
  }
  return years;
}

/**
 * Finds a trip by id among both taken and planned trips, since a link to a
 * planned one still has to resolve.
 * @param {string | null} id - The trip id
 * @returns {Trip | undefined} The trip
 */
export function findTrip(id: string | null): Trip | undefined {
  return [...visitedTrips, ...futureTrips].find((trip) => trip.id === id);
}
