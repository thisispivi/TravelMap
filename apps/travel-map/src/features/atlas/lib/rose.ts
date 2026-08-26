import { Trip } from "@travelmap/core";

import { Reckoning } from "@/shared/lib/bearings";

/* Distances compress towards the origin on a logarithmic radius so a weekend
   four hundred kilometres away is still legible next to a flight to the far
   side of the world. The reference keeps the innermost decade from collapsing
   onto the mark. */
const DISTANCE_REFERENCE_KM = 200;
const INNER_RADIUS = 0.09;
const OUTER_RADIUS = 0.94;
const MIN_DOT = 0.011;
const MAX_DOT = 0.032;
const DOT_DAYS_REFERENCE = 16;

/* Distance rings the rose is graduated with, in kilometres. */
const RANGE_RINGS_KM = [500, 1000, 2500, 5000, 10_000, 15_000];

/**
 * One journey placed on the rose. The angle is the journey's true bearing and
 * the radius its true distance, so the rose is an azimuthal plot of the record
 * rather than a decorative dial.
 * @property {Trip} trip - The journey plotted
 * @property {number} x - The horizontal position in unit coordinates from the mark
 * @property {number} y - The vertical position in unit coordinates from the mark
 * @property {number} radius - The plotted radius in unit coordinates
 * @property {number} dot - The endpoint radius, scaled by how long the journey lasted
 * @property {number} bearing - The journey's bearing in degrees
 * @property {number} distanceKm - The journey's distance in kilometres
 * @property {boolean} isPlanned - Whether the journey has not been taken yet
 */
export interface RosePoint {
  trip: Trip;
  x: number;
  y: number;
  radius: number;
  dot: number;
  bearing: number;
  distanceKm: number;
  isPlanned: boolean;
}

/**
 * Places a distance on the rose's logarithmic radius.
 * @param {number} distanceKm - The distance from the mark in kilometres
 * @param {number} maxDistanceKm - The furthest distance in the record
 * @returns {number} The radius in unit coordinates
 */
export function toRadius(distanceKm: number, maxDistanceKm: number): number {
  const span = Math.log1p(
    Math.max(maxDistanceKm, DISTANCE_REFERENCE_KM) / DISTANCE_REFERENCE_KM,
  );
  const reach = Math.log1p(Math.max(distanceKm, 0) / DISTANCE_REFERENCE_KM);
  const ratio = span === 0 ? 0 : Math.min(reach / span, 1);
  return INNER_RADIUS + (OUTER_RADIUS - INNER_RADIUS) * ratio;
}

/**
 * Projects reckoned journeys onto the rose.
 * @param {Reckoning[]} reckonings - The measured journeys to plot
 * @param {Set<string>} plannedIds - Identifiers of journeys not yet taken
 * @returns {RosePoint[]} The plotted journeys, furthest first so short hops draw on top
 */
export function plotRose(
  reckonings: Reckoning[],
  plannedIds: Set<string>,
): RosePoint[] {
  const maxDistanceKm = reckonings.reduce(
    (furthest, entry) => Math.max(furthest, entry.distanceKm),
    0,
  );

  return reckonings
    .filter((entry) => entry.furthest !== null)
    .map((entry) => {
      const radius = toRadius(entry.distanceKm, maxDistanceKm);
      const angle = ((entry.bearing - 90) * Math.PI) / 180;
      const days = entry.trip.getDurationInDays();
      return {
        trip: entry.trip,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        radius,
        dot:
          MIN_DOT +
          (MAX_DOT - MIN_DOT) *
            Math.min(Math.sqrt(days / DOT_DAYS_REFERENCE), 1),
        bearing: entry.bearing,
        distanceKm: entry.distanceKm,
        isPlanned: plannedIds.has(entry.trip.id),
      };
    })
    .sort((first, second) => second.radius - first.radius);
}

/**
 * Selects the graduation rings that fall inside a record's reach, always
 * keeping the outermost one so the rose has a rim to read distances against.
 * @param {RosePoint[]} points - The plotted journeys
 * @returns {number[]} The ring distances in kilometres
 */
export function visibleRings(points: RosePoint[]): number[] {
  const maxDistanceKm = points.reduce(
    (furthest, point) => Math.max(furthest, point.distanceKm),
    0,
  );
  const inside = RANGE_RINGS_KM.filter((ring) => ring < maxDistanceKm);
  return inside.length > 0 ? inside : RANGE_RINGS_KM.slice(0, 1);
}
