import { City } from "@travelmap/core";
import type { Feature, FeatureCollection, LineString, Point } from "geojson";

/**
 * Weight carried by one stay point.
 * @property {number} weight - The city's share of the record's longest stay, from zero to one
 */
interface StayPointProperties {
  weight: number;
}

/**
 * Turns the record's cities into points weighted by how long the record spent
 * in each. The weight is a share of the longest stay rather than an absolute,
 * so the plate reads the same whether a fork holds three journeys or three
 * hundred.
 * @param {City[]} cities - Every city the record touches
 * @param {Map<string, number>} minutesByCity - Minutes spent per city id
 * @returns {FeatureCollection<Point, StayPointProperties>} The weighted stay points
 */
export function toStayPoints(
  cities: City[],
  minutesByCity: Map<string, number>,
): FeatureCollection<Point, StayPointProperties> {
  const longest = Math.max(1, ...minutesByCity.values());
  return {
    type: "FeatureCollection",
    features: cities.map((city) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: city.coordinates },
      properties: {
        weight: Math.sqrt((minutesByCity.get(city.id) ?? 0) / longest),
      },
    })),
  };
}

/**
 * Draws a route as one line, unwrapping longitudes so a leg between Rome and
 * Sydney crosses the antimeridian the short way instead of doubling back across
 * the whole plate.
 * @param {[number, number][]} coordinates - The route's ordered coordinates
 * @returns {Feature<LineString>} The route as a single line feature
 */
export function toUnwrappedRoute(
  coordinates: [number, number][],
): Feature<LineString> {
  const unwrapped: [number, number][] = [];
  let offset = 0;
  coordinates.forEach(([longitude, latitude], index) => {
    const previous = coordinates[index - 1];
    if (previous) {
      const delta = longitude - previous[0];
      if (delta > 180) offset -= 360;
      else if (delta < -180) offset += 360;
    }
    unwrapped.push([longitude + offset, latitude]);
  });

  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates: unwrapped },
    properties: {},
  };
}
