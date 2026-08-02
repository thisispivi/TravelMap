import { City, Trip } from "@travelmap/core";
import { LngLatBounds, type PaddingOptions } from "maplibre-gl";

import { parameters } from "@/shared/lib/parameters";

export const CAMERA_DURATION_MS = 1100;
export const MAPLIBRE_MIN_ZOOM = 0;
export const MAPLIBRE_MAX_ZOOM = 12;
export const SINGLE_DESTINATION_ZOOM = 6.5;
export const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-179, -72],
  [179, 74],
];

const SIDE_PANEL_BREAKPOINT_PX = 680;
const SIDE_PANEL_CLEARANCE_PX = 432;
const NAV_CLEARANCE_PX = 88;
const ZOOM_CONTROLS_CLEARANCE_PX = 64;
const MAP_EDGE_PADDING_PX = 24;
const HOME_COUNTRY_ID = parameters.homeCity?.country.id ?? null;

/**
 * Calculates camera padding around the desktop side panel or mobile overlay.
 * @param {number} viewportWidth - The current map canvas width in pixels
 * @param {boolean} isPanelOpen - Whether a content panel is visible
 * @returns {PaddingOptions} The padding for MapLibre camera transitions
 */
export function getCameraPadding(
  viewportWidth: number,
  isPanelOpen: boolean,
): PaddingOptions {
  const hasSidePanel = viewportWidth >= SIDE_PANEL_BREAKPOINT_PX && isPanelOpen;

  if (!hasSidePanel) {
    return {
      top: MAP_EDGE_PADDING_PX,
      right: MAP_EDGE_PADDING_PX,
      bottom: MAP_EDGE_PADDING_PX,
      left: MAP_EDGE_PADDING_PX,
    };
  }

  return {
    top: NAV_CLEARANCE_PX,
    right: MAP_EDGE_PADDING_PX,
    bottom: ZOOM_CONTROLS_CLEARANCE_PX,
    left: SIDE_PANEL_CLEARANCE_PX,
  };
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
