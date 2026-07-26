import { City, Travel, Trip } from "@travelmap/core";

/**
 * Represents a group trips by year options.
 * @property {number} cutoffYear - The cutoff year
 */
type GroupTripsByYearOptions = { cutoffYear: number };

/**
 * Group trips by year of travel
 * @param {Trip[]} trips - The list of trips to group
 * @param {GroupTripsByYearOptions} options - The options for grouping
 * @param {number} options.cutoffYear - Year cutoff. All travels from this year and below will be grouped together
 * @returns {Record<number, Trip[]>} The trips grouped by year
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

/**
 * Returns every travel entry for a city in chronological order.
 * @param {City} city - The city whose travels should be collected
 * @param {Trip[]} trips - The trips to search
 * @returns {Travel[]} The city's chronological travel entries
 */
export function getCityTravels(city: City, trips: Trip[]): Travel[] {
  return trips
    .flatMap((trip) => trip.getCityTravels(city))
    .sort((a, b) => a.sDate.getTime() - b.sDate.getTime());
}

/**
 * Returns only the photo-bearing travels for a city across all trips,
 * sorted chronologically. Layovers and stays without photos are excluded.
 * @param {City} city - The city whose photo travels should be collected
 * @param {Trip[]} trips - The trips to search
 * @returns {Travel[]} The city's chronological photo-bearing travels
 */
export function getCityPhotoTravels(city: City, trips: Trip[]): Travel[] {
  return getCityTravels(city, trips).filter((t) => t.photos.length > 0);
}

/**
 * Finds a city's photo-bearing travel by its gallery index.
 * @param {City} city - The city whose travel should be found
 * @param {number} travelIdx - The travel's gallery index
 * @param {Trip[]} trips - The trips to search
 * @returns {Travel | undefined} The matching travel when present
 */
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
 * @param {City} city - The city whose photo travels should be searched
 * @param {Date} stopSDate - The start date used to identify the travel
 * @param {Trip[]} trips - The trips to search
 * @returns {number} The matching photo travel index or `-1`
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
