import { Trip } from "../core";

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
