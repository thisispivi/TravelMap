import { City, Travel, Trip } from "@travelmap/core";

/**
 * Returns every travel entry for a city in chronological order.
 * @param {City} city - The city whose travels should be collected
 * @param {Trip[]} trips - The trips to search
 * @returns {Travel[]} The city's chronological travel entries
 */
export function getCityTravels(city: City, trips: Trip[]): Travel[] {
  return trips
    .flatMap((trip) => trip.getCityTravels(city))
    .sort((first, second) => first.sDate.getTime() - second.sDate.getTime());
}

/**
 * Returns the photo-bearing travels for a city in chronological order.
 * @param {City} city - The city whose photo travels should be collected
 * @param {Trip[]} trips - The trips to search
 * @returns {Travel[]} The city's chronological photo-bearing travels
 */
export function getCityPhotoTravels(city: City, trips: Trip[]): Travel[] {
  return getCityTravels(city, trips).filter(
    (travel) => travel.photos.length > 0,
  );
}

/**
 * Finds a city's photo-bearing travel by its gallery index.
 * @param {City} city - The city whose travel should be found
 * @param {number} travelIndex - The travel's gallery index
 * @param {Trip[]} trips - The trips to search
 * @returns {Travel | undefined} The matching travel when present
 */
export function getTravelByCityIndex(
  city: City,
  travelIndex: number,
  trips: Trip[],
): Travel | undefined {
  return getCityPhotoTravels(city, trips)[travelIndex];
}

/**
 * Finds the gallery index for a photo-bearing stop.
 * @param {City} city - The city whose photo travels should be searched
 * @param {Date} stopStartDate - The stop start date used as its stable identity
 * @param {Trip[]} trips - The trips to search
 * @returns {number} The matching photo travel index, or `-1`
 */
export function getPhotoTravelIndex(
  city: City,
  stopStartDate: Date,
  trips: Trip[],
): number {
  return getCityPhotoTravels(city, trips).findIndex(
    (travel) => travel.sDate.getTime() === stopStartDate.getTime(),
  );
}
