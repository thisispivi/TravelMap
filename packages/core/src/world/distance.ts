import { City } from "../classes/City";

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the great-circle distance between two city coordinates.
 * @param {City} start - Departure city
 * @param {City} end - Arrival city
 * @returns {number} Distance in kilometres
 */
export function getCitiesDistance(start: City, end: City): number {
  const startPoint = start.getCoordinatesAsLatLon();
  const endPoint = end.getCoordinatesAsLatLon();

  /**
   * Converts an angle to radians for the haversine terms below.
   * @param {number} degrees - Angle in degrees
   * @returns {number} The angle in radians
   */
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  const latitudeDelta = toRadians(endPoint.lat - startPoint.lat);
  const longitudeDelta = toRadians(endPoint.lon - startPoint.lon);
  const latitudeStart = toRadians(startPoint.lat);
  const latitudeEnd = toRadians(endPoint.lat);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeStart) *
      Math.cos(latitudeEnd) *
      Math.sin(longitudeDelta / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
