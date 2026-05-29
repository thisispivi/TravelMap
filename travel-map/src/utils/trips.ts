import { City, Travel, Trip } from "../core";

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

export function getCityTravels(city: City, trips: Trip[]): Travel[] {
  return trips
    .flatMap((trip) => trip.getCityTravels(city))
    .sort((a, b) => a.sDate.getTime() - b.sDate.getTime());
}

/**
 * Returns only the photo-bearing travels for a city across all trips,
 * sorted chronologically. Layovers and stays without photos are excluded.
 */
export function getCityPhotoTravels(city: City, trips: Trip[]): Travel[] {
  return getCityTravels(city, trips).filter((t) => t.photos.length > 0);
}

export function getTravelByCityIndex(
  city: City,
  travelIdx: number,
  trips: Trip[],
): Travel | undefined {
  return getCityPhotoTravels(city, trips)[travelIdx];
}

/**
 * Returns the index of the photo-bearing travel whose start date matches
 * the given stop's start date, or -1 if none is found.
 * This is the correct index to use when navigating to the gallery from
 * a timeline stop, since stop dates are stable across trips.
 */
export function getPhotoTravelIndex(
  city: City,
  stopSDate: Date,
  trips: Trip[],
): number {
  return getCityPhotoTravels(city, trips).findIndex(
    (t) => t.sDate.getTime() === stopSDate.getTime(),
  );
}
