import { City } from "@travelmap/core";

/** The four directions a record can be bounded in. */
type BoundDirection = "north" | "south" | "east" | "west";

/**
 * The furthest place reached in one direction.
 * @property {BoundDirection} direction - Which edge of the record this is
 * @property {City} city - The place at that edge
 * @property {number} degrees - Its latitude or longitude, whichever the edge is measured on
 */
export interface Bound {
  direction: BoundDirection;
  city: City;
  degrees: number;
}

/**
 * Finds the four places that bound a record. Latitude and longitude are already
 * in the data and nothing was showing them, yet they answer the question a
 * travel record is most often asked: how far north, south, east and west.
 * @param {City[]} cities - Every place visited
 * @returns {Bound[]} The bounding places, ordered north, east, south, west
 */
export function getCardinalBounds(cities: City[]): Bound[] {
  const first = cities[0];
  if (!first) return [];

  let north = first;
  let south = first;
  let east = first;
  let west = first;
  for (const city of cities) {
    if (city.coordinates[1] > north.coordinates[1]) north = city;
    if (city.coordinates[1] < south.coordinates[1]) south = city;
    if (city.coordinates[0] > east.coordinates[0]) east = city;
    if (city.coordinates[0] < west.coordinates[0]) west = city;
  }

  return [
    { direction: "north", city: north, degrees: north.coordinates[1] },
    { direction: "east", city: east, degrees: east.coordinates[0] },
    { direction: "south", city: south, degrees: south.coordinates[1] },
    { direction: "west", city: west, degrees: west.coordinates[0] },
  ];
}

/**
 * Formats a latitude or longitude with the hemisphere letter its direction
 * implies, the way a coordinate is written on a chart.
 * @param {Bound} bound - The bound to format
 * @returns {string} The signed degree reading with its hemisphere
 */
export function formatBoundDegrees(bound: Bound): string {
  const hemispheres: Record<BoundDirection, [string, string]> = {
    north: ["N", "S"],
    south: ["N", "S"],
    east: ["E", "W"],
    west: ["E", "W"],
  };
  const [positive, negative] = hemispheres[bound.direction];
  return `${Math.abs(bound.degrees).toFixed(1)}° ${bound.degrees >= 0 ? positive : negative}`;
}
