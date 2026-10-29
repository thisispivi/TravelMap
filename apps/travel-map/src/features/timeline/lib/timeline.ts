/**
 * The part of a trip the timeline places.
 * @property {Date} sDate - Its first day
 * @property {Date} eDate - Its last day
 */
interface Dated {
  sDate: Date;
  eDate: Date;
}

/**
 * One trip on the timeline.
 * @property {T} trip - The trip
 * @property {number} start - Where it starts in its year, from 0 (1 Jan) to 1
 * @property {number} end - Where it ends, the last day included, capped at 1
 */
interface TimelineEntry<T extends Dated> {
  trip: T;
  start: number;
  end: number;
}

/**
 * The trips that started in one year.
 * @property {number} year - The year
 * @property {TimelineEntry<T>[]} entries - Its trips, in date order
 * @property {number} days - Days spent travelling on those trips
 */
export interface TimelineYear<T extends Dated> {
  year: number;
  entries: TimelineEntry<T>[];
  days: number;
}

const DAY_MS = 86_400_000;

/**
 * Days from one calendar day to another, by the calendar rather than the
 * clock, so a summer-time change never makes a day 23 hours short.
 * @param {Date} from - The earlier day
 * @param {Date} to - The later day
 * @returns {number} Whole days between them
 */
function daysBetween(from: Date, to: Date): number {
  return Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
      DAY_MS,
  );
}

/**
 * Places a day within its year, as a share of the year.
 * @param {Date} date - The day
 * @param {number} year - The year to measure against
 * @returns {number} From 0 (1 Jan) to 1 (the end of 31 Dec)
 */
function shareOfYear(date: Date, year: number): number {
  const days = daysBetween(new Date(year, 0, 1), new Date(year + 1, 0, 1));
  return Math.min(
    Math.max(daysBetween(new Date(year, 0, 1), date) / days, 0),
    1,
  );
}

/**
 * Groups trips by the year they started, newest year first and each year's
 * trips in date order, and places every trip on its year as shares of it. A
 * trip over New Year stays in the year it started and runs to its end.
 * @param {T[]} trips - The trips
 * @returns {TimelineYear<T>[]} The years with trips, newest first
 */
export function buildTimeline<T extends Dated>(trips: T[]): TimelineYear<T>[] {
  const sorted = trips.toSorted(
    (first, second) => first.sDate.getTime() - second.sDate.getTime(),
  );
  const years: TimelineYear<T>[] = [];

  for (const trip of sorted) {
    const year = trip.sDate.getFullYear();
    const entry: TimelineEntry<T> = {
      end: shareOfYear(new Date(trip.eDate.getTime() + DAY_MS), year),
      start: shareOfYear(trip.sDate, year),
      trip,
    };
    const days = daysBetween(trip.sDate, trip.eDate) + 1;
    const current = years.at(-1);
    if (current?.year === year) {
      current.entries.push(entry);
      current.days += days;
    } else years.push({ days, entries: [entry], year });
  }

  return years.reverse();
}
