import { TransportMode, Trip } from "@travelmap/core";
import type { FeatureCollection, LineString } from "geojson";

/**
 * How a leg is drawn. A flight is an arc, because the straight line between
 * two airports says nothing true about the route; a ride on the ground or the
 * sea is a solid line; a day trip that comes back to the same bed is dotted,
 * so "based in Kyoto, went to Osaka" reads apart from the journey itself.
 */
export type RouteStroke = "flight" | "ground" | "outing";

/**
 * What each route segment carries, for the shared route layers to style it.
 * @property {string} id - Identifies the ride, for selecting it
 * @property {TransportMode} mode - Its transport mode, which picks its colour
 * @property {RouteStroke} stroke - How it is drawn
 */
export interface RouteProperties {
  id: string;
  mode: TransportMode;
  stroke: RouteStroke;
}

/* Flights last, so their arcs pass over the ground lines they cross. */
export const ROUTE_STROKE_ORDER: RouteStroke[] = ["ground", "outing", "flight"];

/**
 * Names the layer that draws one stroke's lines.
 * @param {string} id - The routes' source id
 * @param {RouteStroke} stroke - The stroke
 * @returns {string} The layer id
 */
export function routeLineLayerId(id: string, stroke: RouteStroke): string {
  return `${id}-line-${stroke}`;
}

/**
 * Names every layer that draws the lines themselves, for a map that lets them
 * be pressed.
 * @param {string} id - The routes' source id
 * @returns {string[]} The line layer ids
 */
export function routeLineLayerIds(id: string): string[] {
  return ROUTE_STROKE_ORDER.map((stroke) => routeLineLayerId(id, stroke));
}

/** Route segments, as the shared route layers draw them. */
export type RouteFeatures = FeatureCollection<LineString, RouteProperties>;

/* How far an arc bows out, as a share of the distance it spans. */
const ARC_BOW = 0.18;
const ARC_SEGMENTS = 40;

/**
 * Moves a destination's longitude by whole turns of the globe so it lies
 * within 180° of the start. A route from Sydney to Los Angeles then crosses
 * the Pacific instead of circling west over Asia; MapLibre draws longitudes
 * past ±180 on the neighbouring copy of the world, so the line stays whole.
 * @param {[number, number]} from - The start, as `[lng, lat]`
 * @param {[number, number]} to - The end, as `[lng, lat]`
 * @returns {[number, number]} The end on the short side of the antimeridian
 */
export function nearSide(
  from: [number, number],
  to: [number, number],
): [number, number] {
  const delta = ((((to[0] - from[0]) % 360) + 540) % 360) - 180;
  return [from[0] + delta, to[1]];
}

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
  const [x2, y2] = nearSide(from, to);
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
 * Picks how a ride is drawn: a flight is always an arc, even on a day trip.
 * @param {TransportMode} mode - How it travels
 * @param {boolean} isOuting - Whether it belongs to a day trip
 * @returns {RouteStroke} Its stroke
 */
export function routeStroke(
  mode: TransportMode,
  isOuting: boolean,
): RouteStroke {
  if (mode === "plane") return "flight";
  return isOuting ? "outing" : "ground";
}

/**
 * Draws one segment from one place to the next: an arc for a flight, the
 * short way round the globe for anything else.
 * @param {[number, number]} from - The start, as `[lng, lat]`
 * @param {[number, number]} to - The end, as `[lng, lat]`
 * @param {RouteProperties} properties - Its id, mode and stroke
 * @returns {RouteFeatures["features"][number]} The segment
 */
export function routeSegment(
  from: [number, number],
  to: [number, number],
  properties: RouteProperties,
): RouteFeatures["features"][number] {
  return {
    geometry: {
      coordinates:
        properties.stroke === "flight"
          ? arcBetween(from, to)
          : [from, nearSide(from, to)],
      type: "LineString",
    },
    properties,
    type: "Feature",
  };
}

/**
 * Turns a trip's legs into route segments, each leg split at the places it
 * called at so a ferry's stops bend its line.
 * @param {Trip} trip - The trip to draw
 * @returns {RouteFeatures} The segments
 */
export function tripRouteFeatures(trip: Trip): RouteFeatures {
  return {
    features: trip.getLegs().flatMap((leg, legIndex) => {
      const cities = [leg.from, ...leg.via, leg.to];
      return cities.slice(0, -1).map((city, index) =>
        routeSegment(city.coordinates, cities[index + 1].coordinates, {
          id: `${legIndex}:${index}`,
          mode: leg.mode,
          stroke: routeStroke(leg.mode, leg.context === "outing"),
        }),
      );
    }),
    type: "FeatureCollection",
  };
}
