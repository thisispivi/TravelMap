import { City, Trip } from "@travelmap/core";
import { LngLatBounds, type PaddingOptions } from "maplibre-gl";

import {
  SHEET_HALF_HIDDEN_SHARE,
  SHEET_PEEK_PX,
  SHEET_TOP_PX,
} from "@/shared/components/BottomSheet/BottomSheet.metrics";
import { ResponsiveType } from "@/shared/hooks/useResponsive";
import { parameters } from "@/shared/lib/parameters";
import variables from "@/styles/_variables.module.scss";

export const CAMERA_DURATION_MS = 1100;
export const MAPLIBRE_MIN_ZOOM = 0;
export const MAPLIBRE_MAX_ZOOM = 12;
export const SINGLE_DESTINATION_ZOOM = 6.5;
export const WORLD_CENTER: [number, number] = [0, 0];

const HOME_COUNTRY_ID = parameters.homeCity?.country.id ?? null;
const ROOT_PX = 16;
const MAP_EDGE_PADDING_PX = 32;
/* The phone's floating theme/language buttons and the zoom buttons on wider screens. */
const TOP_TOOLS_PX = 64;
const ZOOM_CONTROLS_PX = 72;

/**
 * Reads a rem length exported by the stylesheet as pixels.
 * @param {string} rem - A value such as `5rem`
 * @returns {number} The length in CSS pixels
 */
function remToPx(rem: string): number {
  return Number.parseFloat(rem) * ROOT_PX;
}

const RAIL_PX = remToPx(variables.railWidth);
const GAP_PX = remToPx(variables.shellGap);
const SIDE_PANEL_PX = remToPx(variables.sidePanelWidth);
const SIDE_PANEL_WIDE_PX = remToPx(variables.sidePanelWidthWide);
const WIDE_BREAKPOINT_PX = remToPx(variables.breakpointWide);
const TAB_BAR_BASE_PX = remToPx(variables.tabBarBase);

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
  return TAB_BAR_BASE_PX + (Number.isNaN(inset) ? 0 : inset);
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
  if (viewport.isCompact) {
    const tabBar = tabBarPx();
    const sheetHeight = viewport.window.height - SHEET_TOP_PX - tabBar;
    const covered = isSideOpen
      ? sheetHeight * (1 - SHEET_HALF_HIDDEN_SHARE)
      : SHEET_PEEK_PX;
    return {
      top: TOP_TOOLS_PX,
      right: MAP_EDGE_PADDING_PX / 2,
      bottom: tabBar + covered + MAP_EDGE_PADDING_PX / 2,
      left: MAP_EDGE_PADDING_PX / 2,
    };
  }

  const panel =
    viewport.window.width >= WIDE_BREAKPOINT_PX
      ? SIDE_PANEL_WIDE_PX
      : SIDE_PANEL_PX;
  return {
    top: MAP_EDGE_PADDING_PX,
    right: ZOOM_CONTROLS_PX,
    bottom: MAP_EDGE_PADDING_PX,
    left:
      RAIL_PX +
      2 * GAP_PX +
      (isSideOpen ? panel + GAP_PX : 0) +
      MAP_EDGE_PADDING_PX,
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
