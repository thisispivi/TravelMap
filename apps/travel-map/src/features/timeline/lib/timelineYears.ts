import { Trip } from "@travelmap/core";

/**
 * The trips that started in one calendar year.
 * @property {number} year - The calendar year
 * @property {Trip[]} trips - The year's trips, most recent first
 */
export interface YearGroup {
  year: number;
  trips: Trip[];
}

/**
 * Groups trips into calendar years by their start date, newest year and newest
 * trip first, which is the order the timeline reads in.
 * @param {Trip[]} trips - The trips to group
 * @returns {YearGroup[]} The year groups in reverse chronological order
 */
export function groupTripsByStartYear(trips: Trip[]): YearGroup[] {
  const byYear = new Map<number, Trip[]>();
  for (const trip of trips) {
    const year = trip.sDate.getFullYear();
    const group = byYear.get(year);
    if (group) group.push(trip);
    else byYear.set(year, [trip]);
  }

  return [...byYear.entries()]
    .sort(([first], [second]) => second - first)
    .map(([year, yearTrips]) => ({
      year,
      trips: yearTrips.toSorted(
        (first, second) => second.sDate.getTime() - first.sDate.getTime(),
      ),
    }));
}
