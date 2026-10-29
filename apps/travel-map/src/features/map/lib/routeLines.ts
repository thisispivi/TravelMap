import { TransportMode, Trip, TripLeg } from "@travelmap/core";
import type { FeatureCollection, LineString } from "geojson";

/**
 * How a leg is drawn. A flight is an arc, because the straight line between
 * two airports says nothing true about the route; a ride on the ground or the
 * sea is a solid line; a day trip that comes back to the same bed is dotted,
 * so "based in Kyoto, went to Osaka" reads apart from the journey itself.
 */
export type RouteStroke = "flight" | "ground" | "outing";

/**
 * The legs of one stroke and mode, as one GeoJSON source.
 * @property {string} key - A stable id for the source and its layers
 * @property {RouteStroke} stroke - How the lines are drawn
 * @property {TransportMode} mode - The transport mode, which picks the colour
 * @property {FeatureCollection<LineString>} data - The lines
 */
export interface RouteLayer {
  key: string;
  stroke: RouteStroke;
  mode: TransportMode;
  data: FeatureCollection<LineString>;
}

/* How far an arc bows out, as a share of the distance it spans. */
const ARC_BOW = 0.18;
const ARC_SEGMENTS = 40;

/**
 * Draws a flight as a gentle arc: a quadratic curve whose control point sits
 * off the midpoint, always bowing to the same side of the direction of travel
 * so an outbound and a return flight separate instead of overlapping.
 * @param {[number, number]} from - The start, as `[lng, lat]`
 * @param {[number, number]} to - The end, as `[lng, lat]`
 * @returns {[number, number][]} The arc's points, ends included
 */
export function arcBetween(
  from: [number, number],
  to: [number, number],
): [number, number][] {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const control: [number, number] = [
    (x1 + x2) / 2 - (y2 - y1) * ARC_BOW,
    (y1 + y2) / 2 + (x2 - x1) * ARC_BOW,
  ];

  return Array.from({ length: ARC_SEGMENTS + 1 }, (_, index) => {
    const t = index / ARC_SEGMENTS;
    const u = 1 - t;
    return [
      u * u * x1 + 2 * u * t * control[0] + t * t * x2,
      u * u * y1 + 2 * u * t * control[1] + t * t * y2,
    ];
  });
}

/**
 * Picks how a leg is drawn.
 * @param {TripLeg} leg - The leg
 * @returns {RouteStroke} Its stroke
 */
function strokeOf(leg: TripLeg): RouteStroke {
  if (leg.mode === "plane") return "flight";
  return leg.context === "outing" ? "outing" : "ground";
}

/**
 * Groups a trip's legs into one source per stroke and mode, each leg split at
 * the cities it called at so a ferry's stops bend its line.
 * @param {Trip} trip - The trip to draw
 * @returns {RouteLayer[]} The layers, flights last so they draw on top
 */
export function buildRouteLayers(trip: Trip): RouteLayer[] {
  const layers = new Map<string, RouteLayer>();

  for (const leg of trip.getLegs()) {
    const stroke = strokeOf(leg);
    const key = `${stroke}-${leg.mode}`;
    const layer = layers.get(key) ?? {
      data: { features: [], type: "FeatureCollection" },
      key,
      mode: leg.mode,
      stroke,
    };
    const cities = [leg.from, ...leg.via, leg.to];
    for (const [index, city] of cities.slice(0, -1).entries()) {
      const next = cities[index + 1].coordinates;
      layer.data.features.push({
        geometry: {
          coordinates:
            stroke === "flight"
              ? arcBetween(city.coordinates, next)
              : [city.coordinates, next],
          type: "LineString",
        },
        properties: {},
        type: "Feature",
      });
    }
    layers.set(key, layer);
  }

  return [...layers.values()].toSorted(
    (first, second) =>
      Number(first.stroke === "flight") - Number(second.stroke === "flight"),
  );
}
