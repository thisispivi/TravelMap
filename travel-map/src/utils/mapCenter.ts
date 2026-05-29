/**
 * Map centering utilities
 *
 * Computes the correct map center to display a geographic point in the
 * visual center of the **visible** map area — i.e. the portion not covered
 * by the left side-panel on desktop or the bottom sheet on mobile.
 *
 * Formula for the horizontal offset at a given zoom:
 *   offset_lon = (panelWidth / 2) / (projectionScale × zoom × π/180)
 *
 * The projection scale (160) matches `PROJECTION_CONFIG` in Map.tsx.
 * The panel width (25rem × 16 px/rem = 400 px) matches `$floatingCardMaxWidth`.
 * On mobile viewports (< 680 px = 42.5 rem) there is no left panel, so no
 * horizontal offset is applied.
 */

/** Must match `PROJECTION_CONFIG.scale` in Map.tsx */
const PROJECTION_SCALE = 160;

/** Must match `$floatingCardMaxWidth` (25rem) × standard 16 px/rem */
const PANEL_WIDTH_PX = 400;

/** Must match the `max-width: 42.5rem` breakpoint where the panel becomes a bottom sheet */
const PANEL_BREAKPOINT_PX = 680;

/**
 * Small upward latitude shift (degrees) so the city/trip is not hidden behind
 * the bottom navigation bar on mobile and looks visually balanced on desktop.
 */
const LAT_OFFSET = 0.18;

/**
 * Computes the map `center` value for `setMapPosition` so that a geographic
 * point appears in the visual center of the visible map area.
 *
 * @param rawCenter - Raw geographic [longitude, latitude]
 * @param zoom      - The ZoomableGroup zoom level used for this view
 * @returns         - Adjusted [longitude, latitude] to pass to setMapPosition
 */
export function computeMapCenter(
  [lon, lat]: [number, number],
  zoom: number,
): [number, number] {
  const windowWidth =
    typeof window !== "undefined" ? window.innerWidth : PANEL_BREAKPOINT_PX;
  const hasSidePanel = windowWidth >= PANEL_BREAKPOINT_PX;
  const lonOffset = hasSidePanel
    ? PANEL_WIDTH_PX / 2 / (PROJECTION_SCALE * zoom * (Math.PI / 180))
    : 0;
  return [lon - lonOffset, lat + LAT_OFFSET];
}
