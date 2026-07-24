import type { Geometry, Position } from "geojson";

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

function clipRingAtLongitude(
  ring: LinearRing,
  longitude: number,
  keepEast: boolean,
): LinearRing {
  const clipped: LinearRing = [];
  const isInside = (point: Position) =>
    keepEast ? point[0] >= longitude : point[0] <= longitude;
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
 * Split a polygon geometry into parts that never cross the antimeridian.
 *
 * MapLibre triangulates a ring spanning -180°/180° as a straight line through
 * the middle of the map — that is what banded Russia, Fiji and Antarctica
 * across the world view.
 *
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
