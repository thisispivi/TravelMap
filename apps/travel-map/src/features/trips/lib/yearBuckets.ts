import type { PillWidths } from "@/shared/components/YearPills/YearPills";

import type { TripYear } from "./trips";

/**
 * One pill of the trip list's year selector.
 * @property {number} year - The year, or the newest year of a folded bucket
 * @property {boolean} isOrEarlier - Whether the pill also holds every year before it
 * @property {TripYear["trips"]} trips - Its trips, newest first
 */
export interface YearBucket {
  year: number;
  isOrEarlier: boolean;
  trips: TripYear["trips"];
}

/**
 * Fits the years into as many pills as there is room for: the newest years get
 * one each, and the last pill folds in that year and every one before it, so
 * the selector never has to scroll.
 * @param {TripYear[]} years - The years with trips, newest first
 * @param {number} slots - How many pills fit
 * @returns {YearBucket[]} The pills, newest first
 */
export function bucketYears(years: TripYear[], slots: number): YearBucket[] {
  const single = years.length <= slots ? years.length : Math.max(slots - 1, 0);
  const buckets = years
    .slice(0, single)
    .map(({ year, trips }) => ({ isOrEarlier: false, trips, year }));
  const rest = years.slice(single);
  const [newest] = rest;
  return newest
    ? [
        ...buckets,
        {
          isOrEarlier: true,
          trips: rest.flatMap(({ trips }) => trips),
          year: newest.year,
        },
      ]
    : buckets;
}

/**
 * Finds the pill a year belongs to: its own, or the folded one that covers it.
 * @param {YearBucket[]} buckets - The pills, newest first
 * @param {number} year - The year
 * @returns {YearBucket | undefined} The pill holding that year
 */
export function bucketOf(
  buckets: YearBucket[],
  year: number,
): YearBucket | undefined {
  return buckets.find(
    (bucket) =>
      bucket.year === year || (bucket.isOrEarlier && year <= bucket.year),
  );
}

/**
 * Counts how many pills fit side by side: every year when they all do,
 * otherwise as many single years as leave room for the folded pill, and never
 * fewer than two.
 * @param {PillWidths} widths - The row's and the pills' widths
 * @param {number} years - How many years have trips
 * @returns {number} The number of pills to show
 */
export function fitSlots(widths: PillWidths, years: number): number {
  const { available, single, folded, gap } = widths;
  if (years * single + (years - 1) * gap <= available) return years;
  const singles = Math.floor((available - folded) / (single + gap));
  return Math.max(2, Math.min(years, singles + 1));
}
