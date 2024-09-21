/**
 * Calculate the distance between two points on the Earth's surface using the Haversine formula.
 * @param {number} lat1 - The latitude of the first point
 * @param {number} lon1 - The longitude of the first point
 * @param {number} lat2 - The latitude of the second point
 * @param {number} lon2 - The longitude of the second point
 * @returns {number} - The distance between the two points in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
