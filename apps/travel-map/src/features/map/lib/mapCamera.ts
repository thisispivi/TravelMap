import { City, Trip } from "@travelmap/core";
import { LngLatBounds, type PaddingOptions } from "maplibre-gl";

import { parameters } from "@/shared/lib/parameters";

export const CAMERA_DURATION_MS = 1100;
export const MAPLIBRE_MIN_ZOOM = 0;
export const MAPLIBRE_MAX_ZOOM = 12;
export const SINGLE_DESTINATION_ZOOM = 6.5;
export const WORLD_CENTER: [number, number] = [0, 0];

const MAP_EDGE_PADDING_PX = 32;
const HOME_COUNTRY_ID = parameters.homeCity?.country.id ?? null;

/**
 * Even padding for camera transitions. The plate is its own layout track now,
 * so nothing overlaps the map and the camera no longer has to be nudged clear
 * of a floating panel.
 * @returns {PaddingOptions} The padding for MapLibre camera transitions
 */
export function getCameraPadding(): PaddingOptions {
  return {
    top: MAP_EDGE_PADDING_PX,
    right: MAP_EDGE_PADDING_PX,
    bottom: MAP_EDGE_PADDING_PX,
    left: MAP_EDGE_PADDING_PX,
  };
}

/**
 * Finds bounds around every place in the record, so returning from a single
 * journey reframes the whole thing rather than leaving the camera wherever that
 * journey happened to end.
 * @param {City[]} cities - Every place the record knows about
 * @returns {LngLatBounds | null} Bounds around them, if there are any
 */
export function getRecordBounds(cities: City[]): LngLatBounds | null {
  const first = cities[0];
  if (!first) return null;

  return cities.reduce(
    (bounds, city) => bounds.extend(city.coordinates),
    new LngLatBounds(first.coordinates, first.coordinates),
  );
}

/**
 * Converts the authored application zoom scale to MapLibre's logarithmic scale.
 * @param {number} zoom - The authored zoom value
 * @returns {number} The equivalent MapLibre zoom
 */
export function toMapLibreZoom(zoom: number): number {
  return Math.log2(Math.max(zoom, 1)) + 1;
}

/**
 * Finds bounds around the meaningful destinations of a trip. Layovers and a
 * domestic origin are excluded when they would pull focus away from the trip.
 * @param {Trip} trip - The trip whose destinations should be framed
 * @returns {LngLatBounds | null} Bounds around the destinations, if any exist
 */
export function getTripBounds(trip: Trip): LngLatBounds | null {
  const cities = new Map<string, City>();

  for (const destination of trip.destinations) {
    if (!destination.isLayover) {
      cities.set(destination.city.name, destination.city);
    }
  }

  const stops = Array.from(cities.values());
  const foreignStops = stops.filter(
    (city) => city.country.id !== HOME_COUNTRY_ID,
  );
  const framedStops = foreignStops.length > 0 ? foreignStops : stops;
  const firstStop = framedStops[0];

  if (!firstStop) return null;

  return framedStops.reduce(
    (bounds, city) => bounds.extend(city.coordinates),
    new LngLatBounds(firstStop.coordinates, firstStop.coordinates),
  );
}
