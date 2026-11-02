import { City, Trip } from "@travelmap/core";
import { unique } from "remeda";

/**
 * The cities at the ends of the map, and how far apart they are.
 * @property {City} north - The northernmost city
 * @property {City} south - The southernmost city
 * @property {City} east - The eastern end of the smallest arc holding every city
 * @property {City} west - The western end of that arc
 * @property {number} latitudeSpan - Degrees between north and south
 * @property {number} longitudeSpan - Degrees between west and east
 */
export interface MapEdges {
  north: City;
  south: City;
  east: City;
  west: City;
  latitudeSpan: number;
  longitudeSpan: number;
}

/** A quarter of the globe, named by its two halves. */
type QuadrantId = "NW" | "NE" | "SW" | "SE";

/**
 * Where on the globe the nights were spent.
 * @property {{ id: QuadrantId; cities: City[] }[]} quadrants - Each quarter with its cities
 * @property {Record<"north" | "south" | "east" | "west", number>} halves - Cities per half
 */
export interface Hemispheres {
  quadrants: { id: QuadrantId; cities: City[] }[];
  halves: Record<"north" | "south" | "east" | "west", number>;
}

/**
 * Lists the cities actually slept in, in travel order. Stopovers, day trips and
 * the cities a trip starts from say nothing about where the nights were spent,
 * and a city lived in was never visited.
 * @param {Trip[]} trips - The trips, oldest first
 * @param {City[]} lived - The cities lived in
 * @returns {City[]} Each city once, by its first night
 */
export function getSleptInCities(trips: Trip[], lived: City[]): City[] {
  return unique(
    trips.flatMap((trip) => trip.stays.map((stay) => stay.city)),
  ).filter((city) => !lived.includes(city));
}

/**
 * Finds the edges of the map. East and west are the ends of the smallest arc of
 * longitude holding every city, found as what is left around the widest empty
 * stretch of the globe, so a map spanning the Pacific is not measured the long
 * way round. Ties go to the earliest city.
 * @param {City[]} cities - The cities, in travel order
 * @returns {MapEdges | undefined} The edges, or undefined without cities
 */
export function getMapEdges(cities: City[]): MapEdges | undefined {
  if (cities.length === 0) return undefined;

  const [first] = cities;
  const north = cities.reduce(
    (best, city) => (city.coordinates[1] > best.coordinates[1] ? city : best),
    first,
  );
  const south = cities.reduce(
    (best, city) => (city.coordinates[1] < best.coordinates[1] ? city : best),
    first,
  );
  const byLongitude = cities.toSorted(
    (a, b) => a.coordinates[0] - b.coordinates[0],
  );
  const last = byLongitude.length - 1;
  let widestGap =
    byLongitude[0].coordinates[0] + 360 - byLongitude[last].coordinates[0];
  let arcStart = 0;
  for (let index = 1; index <= last; index += 1) {
    const gap =
      byLongitude[index].coordinates[0] - byLongitude[index - 1].coordinates[0];
    if (gap > widestGap) {
      widestGap = gap;
      arcStart = index;
    }
  }

  return {
    east: byLongitude[arcStart === 0 ? last : arcStart - 1],
    latitudeSpan: north.coordinates[1] - south.coordinates[1],
    longitudeSpan: 360 - widestGap,
    north,
    south,
    west: byLongitude[arcStart],
  };
}

/**
 * Sorts cities into the quarters and the simple halves of the globe, north of
 * the equator and east of Greenwich, each including the line itself.
 * @param {City[]} cities - The cities, in travel order
 * @returns {Hemispheres} The quarters and the halves
 */
export function getHemispheres(cities: City[]): Hemispheres {
  /**
   * Tells whether a city lies north of the equator.
   * @param {City} city - The city
   * @returns {boolean} Whether it is in the northern half
   */
  const isNorth = (city: City): boolean => city.coordinates[1] >= 0;

  /**
   * Tells whether a city lies east of Greenwich.
   * @param {City} city - The city
   * @returns {boolean} Whether it is in the eastern half
   */
  const isEast = (city: City): boolean => city.coordinates[0] >= 0;
  const north = cities.filter(isNorth).length;
  const east = cities.filter(isEast).length;
  const quadrants: Hemispheres["quadrants"] = (
    [
      ["NW", true, false],
      ["NE", true, true],
      ["SW", false, false],
      ["SE", false, true],
    ] as const
  ).map(([id, wantsNorth, wantsEast]) => ({
    cities: cities.filter(
      (city) => isNorth(city) === wantsNorth && isEast(city) === wantsEast,
    ),
    id,
  }));

  return {
    halves: {
      east,
      north,
      south: cities.length - north,
      west: cities.length - east,
    },
    quadrants,
  };
}
