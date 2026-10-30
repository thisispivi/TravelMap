import { City, Trip } from "@travelmap/core";
import { remToPx } from "@travelmap/ui/lib/rem";
import variables from "@travelmap/ui/styles/_variables.module.scss";
import { LngLatBounds, type PaddingOptions } from "maplibre-gl";

import {
  SHEET_HALF_HIDDEN_SHARE,
  SHEET_PEEK_REM,
  SHEET_TOP_REM,
} from "@/shared/components/BottomSheet/BottomSheet.metrics";
import { ResponsiveType } from "@/shared/hooks/useResponsive";
import { parameters } from "@/shared/lib/parameters";

export const CAMERA_DURATION_MS = 1100;
export const MAPLIBRE_MIN_ZOOM = 0;
export const MAPLIBRE_MAX_ZOOM = 12;
export const SINGLE_DESTINATION_ZOOM = 6.5;
export const WORLD_CENTER: [number, number] = [0, 0];

const HOME_COUNTRY_ID = parameters.homeCity?.country.id ?? null;
const MAP_EDGE_PADDING_REM = 2;
/* The phone's floating theme/language buttons and the zoom buttons on wider screens. */
const TOP_TOOLS_REM = 4;
const ZOOM_CONTROLS_REM = 4.5;

/**
 * Reads a rem length exported by the stylesheet as pixels. The layout is sized in
 * rem, so the camera pads for the panels as they are actually drawn.
 * @param {string} rem - A value such as `5rem`
 * @returns {number} The length in CSS pixels
 */
function stylesheetPx(rem: string): number {
  return remToPx(Number.parseFloat(rem));
}

/**
 * Measures the tab bar as drawn: its base height plus the home-indicator
 * inset the stylesheet adds on phones that have one.
 * @returns {number} The tab bar's height in CSS pixels
 */
function tabBarPx(): number {
  const inset = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--safe-area-bottom",
    ),
  );
  return stylesheetPx(variables.tabBarBase) + (Number.isNaN(inset) ? 0 : inset);
}

/**
 * Calculates camera padding so whatever the camera frames lands in the part
 * of the map no panel covers: right of the rail and side panel on wider
 * screens, above the tab bar and bottom sheet on phones.
 * @param {ResponsiveType} viewport - The current viewport
 * @param {boolean} isSideOpen - Whether the side panel or sheet is open
 * @returns {PaddingOptions} The padding for MapLibre camera transitions
 */
export function getCameraPadding(
  viewport: ResponsiveType,
  isSideOpen: boolean,
): PaddingOptions {
  const edge = remToPx(MAP_EDGE_PADDING_REM);

  if (viewport.isCompact) {
    const tabBar = tabBarPx();
    const sheetHeight =
      viewport.window.height - remToPx(SHEET_TOP_REM) - tabBar;
    const covered = isSideOpen
      ? sheetHeight * (1 - SHEET_HALF_HIDDEN_SHARE)
      : remToPx(SHEET_PEEK_REM);
    return {
      top: remToPx(TOP_TOOLS_REM),
      right: edge / 2,
      bottom: tabBar + covered + edge / 2,
      left: edge / 2,
    };
  }

  const gap = stylesheetPx(variables.shellGap);
  const panel = stylesheetPx(
    viewport.window.width >= stylesheetPx(variables.breakpointWide)
      ? variables.sidePanelWidthWide
      : variables.sidePanelWidth,
  );
  return {
    top: edge,
    right: remToPx(ZOOM_CONTROLS_REM),
    bottom: edge,
    left:
      stylesheetPx(variables.railWidth) +
      2 * gap +
      (isSideOpen ? panel + gap : 0) +
      edge,
  };
}

/**
 * Converts camera padding into a center offset for `flyTo`, which takes an
 * offset rather than padding.
 * @param {ResponsiveType} viewport - The current viewport
 * @param {boolean} isSideOpen - Whether the side panel or sheet is open
 * @returns {[number, number]} The x and y offset in pixels
 */
export function getCameraOffset(
  viewport: ResponsiveType,
  isSideOpen: boolean,
): [number, number] {
  const {
    bottom = 0,
    left = 0,
    right = 0,
    top = 0,
  } = getCameraPadding(viewport, isSideOpen);

  return [(left - right) / 2, (top - bottom) / 2];
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
    if (destination.kind !== "stopover") {
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
