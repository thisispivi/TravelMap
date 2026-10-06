import { Trip } from "@travelmap/core";

/**
 * Options for grouping trips by year.
 * @property {number} cutoffYear - The year at and below which trips share one bucket
 */
interface GroupTripsByYearOptions {
  cutoffYear: number;
}

/**
 * Groups trips into every calendar year they span.
 * @param {Trip[]} trips - The trips to group
 * @param {GroupTripsByYearOptions} options - The grouping options
 * @param {number} options.cutoffYear - The year at and below which trips share one bucket
 * @returns {Record<number, Trip[]>} Trips indexed by display year
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
