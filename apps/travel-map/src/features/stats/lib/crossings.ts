import { Trip } from "@travelmap/core";
import { tripRouteFeatures } from "@travelmap/ui/map/lib/routeLines";

/** One of the lines drawn on every globe. */
export type EarthLineId =
  | "arctic"
  | "cancer"
  | "equator"
  | "capricorn"
  | "antarctic"
  | "primeMeridian"
  | "antimeridian";

/**
 * Where a line lies on the globe.
 * @property {"lat" | "lng"} axis - A parallel or a meridian
 * @property {number} at - Its latitude or longitude
 */
interface EarthLinePosition {
  axis: "lat" | "lng";
  at: number;
}

/**
 * How often the routes crossed one line.
 * @property {EarthLineId} id - The line
 * @property {number} count - Crossings across every trip
 * @property {Trip[]} trips - The trips that crossed it, oldest first
 */
export interface LineCrossings {
  id: EarthLineId;
  count: number;
  trips: Trip[];
}

const EARTH_LINES: (EarthLinePosition & { id: EarthLineId })[] = [
  { at: 66.5636, axis: "lat", id: "arctic" },
  { at: 23.4364, axis: "lat", id: "cancer" },
  { at: 0, axis: "lat", id: "equator" },
  { at: -23.4364, axis: "lat", id: "capricorn" },
  { at: -66.5636, axis: "lat", id: "antarctic" },
  { at: 0, axis: "lng", id: "primeMeridian" },
  { at: 180, axis: "lng", id: "antimeridian" },
];

/**
 * Tells which side of a line a point is on. Route longitudes run past ±180
 * instead of wrapping, so a meridian's sides are numbered by whole turns of the
 * globe: a route passing 180 changes side once, and the ±180 seam itself never
 * looks like a jump. A point exactly on the line has no side.
 * @param {number[]} point - The point, as `[lng, lat]`
 * @param {EarthLinePosition} line - The line
 * @returns {number | null} The side, or null on the line itself
 */
function sideOf(point: number[], line: EarthLinePosition): number | null {
  if (line.axis === "lat")
    return point[1] === line.at ? null : Number(point[1] > line.at);
  const turns = (point[0] - line.at) / 360;
  return Number.isInteger(turns) ? null : Math.floor(turns);
}

/**
 * Counts how often one drawn line passes from one side of an earth line to the
 * other, so a route running along it, or touching it and turning back, does not
 * count at all. A route with an unusable coordinate is skipped.
 * @param {number[][]} points - The route's points, as `[lng, lat]`
 * @param {EarthLinePosition} line - The line
 * @returns {number} The crossings
 */
export function countCrossings(
  points: number[][],
  line: EarthLinePosition,
): number {
  if (!points.flat().every(Number.isFinite)) return 0;
  let crossings = 0;
  let previous: number | null = null;
  for (const point of points) {
    const side = sideOf(point, line);
    if (side === null) continue;
    if (previous !== null) crossings += Math.abs(side - previous);
    previous = side;
  }
  return crossings;
}

/**
 * Counts every line's crossings along the geometry the map draws, arcs included,
 * so the page never disagrees with what the map shows.
 * @param {Trip[]} trips - The trips, oldest first
 * @returns {LineCrossings[]} One entry per line, including lines never crossed
 */
export function getLineCrossings(trips: Trip[]): LineCrossings[] {
  const routes = trips.map((trip) => ({
    lines: tripRouteFeatures(trip).features.map(
      ({ geometry }) => geometry.coordinates,
    ),
    trip,
  }));

  return EARTH_LINES.map((line) => {
    const perTrip = routes.map(({ lines, trip }) => ({
      count: lines.reduce(
        (sum, points) => sum + countCrossings(points, line),
        0,
      ),
      trip,
    }));
    return {
      count: perTrip.reduce((sum, { count }) => sum + count, 0),
      id: line.id,
      trips: perTrip.filter(({ count }) => count > 0).map(({ trip }) => trip),
    };
  });
}
