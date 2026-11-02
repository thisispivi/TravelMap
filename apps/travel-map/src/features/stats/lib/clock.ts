import { City, hasTime, Trip } from "@travelmap/core";

/**
 * A ride at the far end of the day.
 * @property {number} minute - Its time, in minutes since midnight on the local clock
 * @property {City} from - Where it left
 * @property {City} to - Where it arrived
 * @property {Trip} trip - The trip it belongs to
 */
interface ClockRide {
  minute: number;
  from: City;
  to: City;
  trip: Trip;
}

/**
 * When the rides left and arrived, each read on its own city's clock.
 * @property {number[]} departures - Departures in each of the day's 24 hours
 * @property {number[]} arrivals - Arrivals in each of the day's 24 hours
 * @property {ClockRide} [earliest] - The earliest departure of the waking day
 * @property {ClockRide} [latest] - The latest arrival of the waking day
 */
export interface TravelClock {
  departures: number[];
  arrivals: number[];
  earliest?: ClockRide;
  latest?: ClockRide;
}

const MINUTES_PER_DAY = 1440;
/* A clock reading before 3am belongs to the night before: it is a very late arrival, not an early one. */
const DAY_STARTS_AT_MINUTE = 180;

/**
 * Reads the time of day off a local date.
 * @param {string} value - A YYYY-MM-DDTHH:mm local date
 * @returns {number} Minutes since midnight
 */
function minuteOfDay(value: string): number {
  return Number(value.slice(11, 13)) * 60 + Number(value.slice(14, 16));
}

/**
 * Places a time of day on a day that starts in the small hours.
 * @param {number} minute - Minutes since midnight
 * @returns {number} Minutes since the day started
 */
function minuteOfWakingDay(minute: number): number {
  return (minute - DAY_STARTS_AT_MINUTE + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/**
 * Counts the rides per hour of the day and finds the two extremes. A ride whose
 * time was never recorded says nothing about the hour, and ties go to the
 * earliest trip.
 * @param {Trip[]} trips - The trips taken
 * @returns {TravelClock} The hours and the extremes
 */
export function getTravelClock(trips: Trip[]): TravelClock {
  const clock: TravelClock = {
    arrivals: Array.from({ length: 24 }, () => 0),
    departures: Array.from({ length: 24 }, () => 0),
  };
  const byDate = trips.toSorted(
    (a, b) => a.sDate.getTime() - b.sDate.getTime(),
  );

  for (const trip of byDate)
    for (const { depart, arrive, from, to } of trip.getLegs()) {
      if (hasTime(depart)) {
        const minute = minuteOfDay(depart);
        clock.departures[Math.floor(minute / 60)] += 1;
        if (
          !clock.earliest ||
          minuteOfWakingDay(minute) < minuteOfWakingDay(clock.earliest.minute)
        )
          clock.earliest = { from, minute, to, trip };
      }
      if (hasTime(arrive)) {
        const minute = minuteOfDay(arrive);
        clock.arrivals[Math.floor(minute / 60)] += 1;
        if (
          !clock.latest ||
          minuteOfWakingDay(minute) > minuteOfWakingDay(clock.latest.minute)
        )
          clock.latest = { from, minute, to, trip };
      }
    }
  return clock;
}
