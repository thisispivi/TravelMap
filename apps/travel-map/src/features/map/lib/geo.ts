import type { Geometry, Position } from "geojson";

/**
 * Represents a linear ring.
 */
type LinearRing = Position[];

/**
 * Get the signed area of a closed ring.
 * @param {number[][]} ring - Closed ring of [lng, lat] points
 * @returns {number} The signed area, positive when the ring winds counter-clockwise
 */
export function ringArea(ring: number[][]): number {
  let area = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[(index + 1) % ring.length];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

/**
 * Get the centroid of a closed ring.
 * @param {number[][]} ring - Closed ring of [lng, lat] points
 * @returns {[number, number]} The centroid, or the first point when the ring is degenerate
 */
export function ringCentroid(ring: number[][]): [number, number] {
  const area = ringArea(ring);
  if (Math.abs(area) < Number.EPSILON) return ring[0] as [number, number];

  let longitude = 0;
  let latitude = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[(index + 1) % ring.length];
    const cross = x1 * y2 - x2 * y1;
    longitude += (x1 + x2) * cross;
    latitude += (y1 + y2) * cross;
  }
  return [longitude / (6 * area), latitude / (6 * area)];
}

/**
 * Clips a polygon ring against one longitude boundary.
 * @param {LinearRing} ring - The polygon ring to clip
 * @param {number} longitude - The clipping longitude
 * @param {boolean} keepEast - Whether to retain points east of the boundary
 * @returns {LinearRing} The clipped closed ring
 */
function clipRingAtLongitude(
  ring: LinearRing,
  longitude: number,
  keepEast: boolean,
): LinearRing {
  const clipped: LinearRing = [];

  /**
   * Checks whether a point lies on the retained side of the boundary.
   * @param {Position} point - The point to test
   * @returns {boolean} Whether the point is inside the clipping boundary
   */
  const isInside = (point: Position) =>
    keepEast ? point[0] >= longitude : point[0] <= longitude;

  /**
   * Finds where a line segment crosses the clipping longitude.
   * @param {Position} from - The segment origin
   * @param {Position} to - The segment destination
   * @returns {Position} The intersection point
   */
  const intersection = (from: Position, to: Position): Position => {
    const progress = (longitude - from[0]) / (to[0] - from[0]);
    return [longitude, from[1] + (to[1] - from[1]) * progress];
  };

  for (let index = 1; index < ring.length; index += 1) {
    const from = ring[index - 1];
    const to = ring[index];
    const fromInside = isInside(from);
    const toInside = isInside(to);
    if (fromInside && toInside) clipped.push(to);
    else if (fromInside) clipped.push(intersection(from, to));
    else if (toInside) clipped.push(intersection(from, to), to);
  }

  if (clipped.length > 0) clipped.push(clipped[0]);
  return clipped;
}

/**
 * Splits a polygon ring into closed parts that do not cross the antimeridian.
 * @param {LinearRing} ring - The polygon ring to split
 * @returns {LinearRing[]} The visible closed ring parts
 */
function splitRingAtAntimeridian(ring: LinearRing): LinearRing[] {
  if (ring.length < 4) return [];

  const unwrapped: LinearRing = [ring[0]];
  for (const point of ring.slice(1)) {
    const previous = unwrapped[unwrapped.length - 1];
    let longitude = point[0];
    while (longitude - previous[0] > 180) longitude -= 360;
    while (longitude - previous[0] < -180) longitude += 360;
    unwrapped.push([longitude, point[1]]);
  }

  const longitudes = unwrapped.map((point) => point[0]);
  const minShift = Math.ceil((-180 - Math.max(...longitudes)) / 360);
  const maxShift = Math.floor((180 - Math.min(...longitudes)) / 360);
  const parts: LinearRing[] = [];

  for (let shift = minShift; shift <= maxShift; shift += 1) {
    const shifted = unwrapped.map(
      ([longitude, latitude]) =>
        [longitude + shift * 360, latitude] as Position,
    );
    const clipped = clipRingAtLongitude(
      clipRingAtLongitude(shifted, -180, true),
      180,
      false,
    );
    if (clipped.length >= 4 && Math.abs(ringArea(clipped)) > 1e-8) {
      parts.push(clipped);
    }
  }
  return parts;
}

/**
 * MapLibre triangulates a ring spanning -180°/180° as a straight line through
 * the middle of the map — that is what banded Russia, Fiji and Antarctica
 * across the world view.
 * @param {Geometry} geometry - Any GeoJSON geometry
 * @returns {Geometry} A MultiPolygon whose rings all stay within [-180, 180]
 */
export function splitGeometryAtAntimeridian(geometry: Geometry): Geometry {
  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : [];
  return {
    type: "MultiPolygon",
    coordinates: polygons.flatMap((polygon) =>
      polygon.flatMap((ring) =>
        splitRingAtAntimeridian(ring).map((part) => [part]),
      ),
    ),
  };
}

/**
 * Interpolates the great-circle path between two coordinates. A straight line
 * between two points in Mercator is not the path anything travels, and over a
 * hemisphere the difference is the whole point of the drawing, so threads on
 * the plate are sampled along the true arc.
 * @param {[number, number]} start - The departure longitude and latitude
 * @param {[number, number]} end - The arrival longitude and latitude
 * @param {number} [steps=64] - How many segments to sample the arc with
 * @returns {[number, number][]} The sampled arc, unwrapped across the antimeridian
 */
export function greatCircle(
  start: [number, number],
  end: [number, number],
  steps: number = 64,
): [number, number][] {
  /**
   * Converts an angle to radians.
   * @param {number} degrees - The angle in degrees
   * @returns {number} The angle in radians
   */
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  /**
   * Converts an angle back to degrees.
   * @param {number} radians - The angle in radians
   * @returns {number} The angle in degrees
   */
  const toDegrees = (radians: number): number => (radians * 180) / Math.PI;
  const [startLongitude, startLatitude] = start;
  const [endLongitude, endLatitude] = end;
  const lat1 = toRadians(startLatitude);
  const lon1 = toRadians(startLongitude);
  const lat2 = toRadians(endLatitude);
  const lon2 = toRadians(endLongitude);
  const delta =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2,
      ),
    );

  if (delta === 0) return [start, end];

  const points: [number, number][] = [];
  for (let step = 0; step <= steps; step += 1) {
    const fraction = step / steps;
    const a = Math.sin((1 - fraction) * delta) / Math.sin(delta);
    const b = Math.sin(fraction * delta) / Math.sin(delta);
    const x =
      a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2);
    const y =
      a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2);
    const z = a * Math.sin(lat1) + b * Math.sin(lat2);
    const longitude = toDegrees(Math.atan2(y, x));
    const latitude = toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const previous = points[points.length - 1];
    /* The map draws a single world copy, so an arc that would wrap is kept
       continuous rather than snapping back across the whole viewport. */
    const unwrapped =
      previous === undefined
        ? longitude
        : longitude - previous[0] > 180
          ? longitude - 360
          : longitude - previous[0] < -180
            ? longitude + 360
            : longitude;
    points.push([unwrapped, latitude]);
  }
  return points;
}
