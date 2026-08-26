import { City } from "../classes/City";

const FULL_TURN_DEGREES = 360;

/**
 * Converts an angle to radians.
 * @param {number} degrees - The angle in degrees
 * @returns {number} The angle in radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates the initial great-circle bearing from one coordinate pair to
 * another, measured clockwise from true north. Initial rather than average
 * bearing because it answers the question the record actually asks: which way
 * did the journey set off.
 * @param {[number, number]} start - Departure longitude and latitude
 * @param {[number, number]} end - Arrival longitude and latitude
 * @returns {number} The bearing in degrees within [0, 360)
 */
export function getCoordinatesBearing(
  start: [number, number],
  end: [number, number],
): number {
  const [startLongitude, startLatitude] = start;
  const [endLongitude, endLatitude] = end;
  const startLatitudeRadians = toRadians(startLatitude);
  const endLatitudeRadians = toRadians(endLatitude);
  const longitudeDelta = toRadians(endLongitude - startLongitude);
  const y = Math.sin(longitudeDelta) * Math.cos(endLatitudeRadians);
  const x =
    Math.cos(startLatitudeRadians) * Math.sin(endLatitudeRadians) -
    Math.sin(startLatitudeRadians) *
      Math.cos(endLatitudeRadians) *
      Math.cos(longitudeDelta);
  const degrees = (Math.atan2(y, x) * 180) / Math.PI;
  return (degrees + FULL_TURN_DEGREES) % FULL_TURN_DEGREES;
}

/**
 * Calculates the initial great-circle bearing between two cities.
 * @param {City} start - The departure city
 * @param {City} end - The arrival city
 * @returns {number} The bearing in degrees within [0, 360)
 */
export function getCitiesBearing(start: City, end: City): number {
  return getCoordinatesBearing(start.coordinates, end.coordinates);
}
