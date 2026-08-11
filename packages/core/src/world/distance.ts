import { City } from "../classes/City";

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the great-circle distance between two dataset coordinate pairs.
 * @param {[number, number]} start - Departure longitude and latitude
 * @param {[number, number]} end - Arrival longitude and latitude
 * @returns {number} Distance in kilometres
 */
export function getCoordinatesDistance(
  start: [number, number],
  end: [number, number],
): number {
  /**
   * Converts an angle to radians for the haversine terms below.
   * @param {number} degrees - Angle in degrees
   * @returns {number} The angle in radians
   */
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  const [startLongitude, startLatitude] = start;
  const [endLongitude, endLatitude] = end;
  const latitudeDelta = toRadians(endLatitude - startLatitude);
  const longitudeDelta = toRadians(endLongitude - startLongitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(startLatitude)) *
      Math.cos(toRadians(endLatitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculates the great-circle distance between two city coordinates.
 * @param {City} start - Departure city
 * @param {City} end - Arrival city
 * @returns {number} Distance in kilometres
 */
export function getCitiesDistance(start: City, end: City): number {
  const startPoint = start.getCoordinatesAsLatLon();
  const endPoint = end.getCoordinatesAsLatLon();

  return getCoordinatesDistance(
    [startPoint.lon, startPoint.lat],
    [endPoint.lon, endPoint.lat],
  );
}
