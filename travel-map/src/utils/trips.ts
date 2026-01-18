import { Trip } from "../core";

/**
 * Sort by travel start date
 * @param {Trip} a - The first trip
 * @param {Trip} b - The second trip
 * @returns {number} - The comparison result
 */
export function sortByTravelStartDate(a: Trip, b: Trip): number {
  const aDate = a.sDate;
  const bDate = b.sDate;
  return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
}

type GroupTripsByYearOptions = { cutoffYear: number };
/**
 * Group trips by year of travel
 * @param {Trip[]} trips - The list of trips to group
 * @param {GroupTripsByYearOptions} options - The options for grouping
 * @param {number} options.cutoffYear - Year cutoff. All travels from this year and below will be grouped together
 * @returns {Record<number, Trip[]>} - The trips grouped by year
 */
export function groupTripsByYear(
  trips: Trip[],
  { cutoffYear }: GroupTripsByYearOptions,
): Record<number, Trip[]> {
  const result: Record<number, Trip[]> = {};

  for (const trip of trips) {
    const startYear = new Date(trip.sDate).getFullYear();
    const endYear = new Date(trip.eDate ?? trip.sDate).getFullYear();

    const fromYear = Math.min(startYear, endYear);
    const toYear = Math.max(startYear, endYear);

    for (let year = fromYear; year <= toYear; year++) {
      const bucketYear = year <= cutoffYear ? cutoffYear : year;

      let tripsForYear = result[bucketYear];
      if (!tripsForYear) tripsForYear = result[bucketYear] = [];

      tripsForYear.push(trip);
    }
  }

  return result;
}
