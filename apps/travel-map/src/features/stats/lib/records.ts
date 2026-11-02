import {
  City,
  getCitiesDistance,
  hasTime,
  Trip,
  TripLeg,
  zonedInstant,
} from "@travelmap/core";
import { unique, uniqueBy } from "remeda";

import { getCityOffsetMinutesOnDate } from "@/shared/lib/timezoneOffset";

/** Which superlative a record is; each names its own label and icon. */
export type RecordId =
  | "longestFlight"
  | "longestFerry"
  | "longestOverland"
  | "longestLayover"
  | "biggestZoneJump"
  | "furthestCity";

/** What a record's value counts, which decides how it is printed. */
type RecordUnit = "km" | "minutes";

/**
 * Who holds a record. It links to its city when it has one, else to its trip.
 * @property {number} value - The figure, in the record's unit
 * @property {City} [city] - The place that holds it
 * @property {Trip} [trip] - The trip that holds it
 * @property {City[]} [route] - The places a ride or a layover is named by
 */
export interface RecordHolder {
  value: number;
  city?: City;
  trip?: Trip;
  route?: City[];
}

/**
 * One row of the records list.
 * @property {RecordId} id - Which record it is
 * @property {RecordUnit} unit - What its value counts
 * @property {RecordHolder} best - The holder
 * @property {RecordHolder} [runnerUp] - The next best
 */
export interface TravelRecord {
  id: RecordId;
  unit: RecordUnit;
  best: RecordHolder;
  runnerUp?: RecordHolder;
}

/**
 * What the records are worked out from.
 * @property {Trip[]} trips - The trips taken
 * @property {City[]} lived - The cities lived in, which do not count as visited
 * @property {City | null} home - The home city
 */
interface RecordSources {
  trips: Trip[];
  lived: City[];
  home: City | null;
}

const MINUTE_MS = 60_000;

/**
 * Ranks holders and keeps the top two. The sort is stable and every list here is
 * built in travel order, so a tie goes to whatever came first.
 * @param {RecordId} id - The record
 * @param {RecordUnit} unit - What its value counts
 * @param {RecordHolder[]} holders - The candidates, oldest first
 * @param {(holder: RecordHolder) => string} [sameAs] - Keeps only the best of candidates sharing a key
 * @returns {TravelRecord[]} The record, or nothing when no candidate exists
 */
function recordOf(
  id: RecordId,
  unit: RecordUnit,
  holders: RecordHolder[],
  sameAs?: (holder: RecordHolder) => string,
): TravelRecord[] {
  const ranked = holders.toSorted((a, b) => b.value - a.value);
  const [best, runnerUp] = sameAs ? uniqueBy(ranked, sameAs) : ranked;
  return best ? [{ best, id, runnerUp, unit }] : [];
}

/**
 * Identifies a ride by its two ends in either direction, so the flight home is
 * not the runner-up to the flight out.
 * @param {RecordHolder} holder - The candidate
 * @returns {string} Its route's key
 */
function routeKey(holder: RecordHolder): string {
  return (holder.route ?? [])
    .map((city) => city.id)
    .toSorted()
    .join("|");
}

/**
 * Lists every wait between two rides of one move, read through each city's own
 * clock. Rides without times, and a next ride timed before the last one landed,
 * say nothing about a wait.
 * @param {Trip} trip - The trip
 * @returns {RecordHolder[]} The layovers
 */
function layoversOf(trip: Trip): RecordHolder[] {
  return trip.moves.flatMap(({ legs }) =>
    legs.slice(1).flatMap((next, index) => {
      const { arrive, to } = legs[index];
      if (!hasTime(arrive) || !hasTime(next.depart)) return [];
      const value =
        (zonedInstant(next.depart, next.from.timeZone) -
          zonedInstant(arrive, to.timeZone)) /
        MINUTE_MS;
      return value > 0 ? [{ route: [to], trip, value }] : [];
    }),
  );
}

/**
 * Measures the widest gap between clocks on one trip, each read on the day the
 * trip started.
 * @param {Trip} trip - The trip
 * @returns {RecordHolder[]} The jump, or nothing when one clock served throughout
 */
function zoneJumpOf(trip: Trip): RecordHolder[] {
  const clocks = unique([
    trip.origin,
    ...trip.steps.flatMap((step) =>
      step.type === "stay" ? [step.city] : [step.from, step.to],
    ),
    ...trip.getLegs().flatMap((leg) => [leg.from, ...leg.via, leg.to]),
  ])
    .map((city) => ({
      city,
      offset: getCityOffsetMinutesOnDate("en-US", city, trip.sDate),
    }))
    .toSorted((a, b) => a.offset - b.offset);
  const low = clocks[0];
  const high = clocks[clocks.length - 1];
  const value = high.offset - low.offset;
  return value > 0 ? [{ route: [low.city, high.city], trip, value }] : [];
}

/**
 * Names a ride as a record's candidate.
 * @param {Trip} trip - The trip it belongs to
 * @param {TripLeg} leg - The ride
 * @param {number} value - The figure it competes with
 * @returns {RecordHolder} The candidate
 */
function rideHolder(trip: Trip, leg: TripLeg, value: number): RecordHolder {
  return { route: [leg.from, leg.to], trip, value };
}

/**
 * Works out the records the dataset can support. A record whose inputs are
 * missing is left out rather than shown empty.
 * @param {RecordSources} sources - The trips and what else the records read
 * @returns {TravelRecord[]} The records
 */
export function getRecords(sources: RecordSources): TravelRecord[] {
  const { trips, lived, home } = sources;
  const byDate = trips.toSorted(
    (a, b) => a.sDate.getTime() - b.sDate.getTime(),
  );
  const rides = byDate.flatMap((trip) =>
    trip.getLegs().map((leg) => ({ leg, trip })),
  );
  const visited = unique(
    byDate.flatMap((trip) =>
      trip.destinations.flatMap(({ city, kind }) =>
        kind === "stopover" ? [] : [city],
      ),
    ),
  ).filter((city) => !lived.includes(city));

  return [
    ...recordOf(
      "longestFlight",
      "km",
      rides.flatMap(({ leg, trip }) =>
        leg.mode === "plane" && leg.distance.value > 0
          ? [rideHolder(trip, leg, leg.distance.value)]
          : [],
      ),
      routeKey,
    ),
    ...recordOf(
      "longestFerry",
      "km",
      rides.flatMap(({ leg, trip }) =>
        leg.mode === "ferry" && leg.company
          ? [rideHolder(trip, leg, leg.distance.value)]
          : [],
      ),
      routeKey,
    ),
    ...recordOf(
      "longestOverland",
      "minutes",
      rides.flatMap(({ leg, trip }) =>
        ["train", "bus", "car"].includes(leg.mode) && leg.duration.value > 0
          ? [rideHolder(trip, leg, leg.duration.value)]
          : [],
      ),
    ),
    ...recordOf("longestLayover", "minutes", byDate.flatMap(layoversOf)),
    ...recordOf("biggestZoneJump", "minutes", byDate.flatMap(zoneJumpOf)),
    ...recordOf(
      "furthestCity",
      "km",
      home
        ? visited
            .filter((city) => city !== home)
            .map((city) => ({
              city,
              value: getCitiesDistance(city, home),
            }))
        : [],
    ),
  ];
}
