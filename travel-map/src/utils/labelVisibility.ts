import { City } from "@/core";

const PROJECTION_SCALE = 160;
const DEG_TO_RAD = Math.PI / 180;

/** Approximate character width in screen pixels at the base label font size. */
const CHAR_WIDTH = 8;
/** Approximate label height in screen pixels. */
const LABEL_HEIGHT = 14;
/** Minimum horizontal gap between labels in screen pixels. */
const GAP_X = 10;
/** Minimum vertical gap between labels in screen pixels. */
const GAP_Y = 6;

/**
 * Above this zoom level, overlap detection is skipped and every city whose
 * population tier threshold is met will be shown — guaranteeing that all
 * labels are visible when fully zoomed in.
 */
const SKIP_OVERLAP_ZOOM = 35;

/**
 * Population-based zoom tiers.
 * Larger cities become visible at lower zoom levels, matching Google Maps
 * behavior where major cities appear first and smaller ones progressively
 * reveal as the user zooms in.
 *
 * The smallest tier (population 0) uses a threshold low enough so that
 * every city is visible well before the maximum zoom (150).
 */
const ZOOM_TIERS = [
  { minPopulation: 3_000_000, minZoom: 2.5 },
  { minPopulation: 1_000_000, minZoom: 4 },
  { minPopulation: 300_000, minZoom: 6 },
  { minPopulation: 100_000, minZoom: 9 },
  { minPopulation: 30_000, minZoom: 14 },
  { minPopulation: 0, minZoom: 20 },
];

function mercatorY(latDeg: number): number {
  const latRad = latDeg * DEG_TO_RAD;
  return Math.log(Math.tan(Math.PI / 4 + latRad / 2));
}

/** Return the minimum zoom level at which a city label should appear. */
export function getMinZoomForPopulation(population: number): number {
  for (const tier of ZOOM_TIERS) {
    if (population >= tier.minPopulation) return tier.minZoom;
  }
  return ZOOM_TIERS[ZOOM_TIERS.length - 1].minZoom;
}

/**
 * Compute the set of city names whose labels should be visible at the
 * current zoom level.
 *
 * The algorithm:
 * 1. Filters cities by population-based zoom thresholds.
 * 2. Sorts remaining cities by population (highest first) for priority.
 * 3. Greedily places labels, skipping any that overlap with already-placed
 *    ones. Overlap is detected using approximate Mercator screen-space
 *    distances.
 *
 * The hovered city's label is always shown.
 */
export function computeVisibleLabels(
  cities: City[],
  zoom: number,
  hoveredCityName?: string | null,
): Set<string> {
  const visible = new Set<string>();

  // Sort by population descending (higher priority first)
  const sorted = [...cities].sort(
    (a, b) => (b.population ?? 0) - (a.population ?? 0),
  );

  const placed: Array<{ x: number; y: number; w: number }> = [];

  // Always place the hovered city first
  if (hoveredCityName) {
    const hovered = sorted.find((c) => c.name === hoveredCityName);
    if (hovered) {
      visible.add(hoveredCityName);
      const [lon, lat] = hovered.coordinates;
      placed.push({
        x: zoom * PROJECTION_SCALE * lon * DEG_TO_RAD,
        y: -zoom * PROJECTION_SCALE * mercatorY(lat),
        w: hovered.name.length * CHAR_WIDTH,
      });
    }
  }

  const skipOverlap = zoom >= SKIP_OVERLAP_ZOOM;

  for (const city of sorted) {
    if (city.name === hoveredCityName) continue;

    const minZoom = getMinZoomForPopulation(city.population ?? 0);
    if (zoom < minZoom) continue;

    // At high zoom levels every qualifying label is shown without
    // overlap checks — at that scale the map is zoomed in far enough
    // that labels are well separated.
    if (skipOverlap) {
      visible.add(city.name);
      continue;
    }

    const [lon, lat] = city.coordinates;
    const x = zoom * PROJECTION_SCALE * lon * DEG_TO_RAD;
    const y = -zoom * PROJECTION_SCALE * mercatorY(lat);
    const w = city.name.length * CHAR_WIDTH;

    let overlaps = false;
    for (const p of placed) {
      const dx = Math.abs(x - p.x);
      const dy = Math.abs(y - p.y);
      if (dx < (w + p.w) / 2 + GAP_X && dy < LABEL_HEIGHT + GAP_Y) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      visible.add(city.name);
      placed.push({ x, y, w });
    }
  }

  return visible;
}
