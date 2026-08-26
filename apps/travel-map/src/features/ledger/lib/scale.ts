import { LedgerSpan } from "@travelmap/core";

/* A three-minute walk inside a three-week journey is a ten-thousandth of it.
   Drawn honestly it would round away to nothing, so every span keeps a floor of
   one pixel: the record may exaggerate a span, but it never loses one. */
const MINIMUM_SPAN_LENGTH = 1;

/* A row must stay tappable even when the time it represents is a hairline, so
   row height and tick height are scaled separately: the row takes the floor,
   the tick beside it stays true. */
const MINIMUM_ROW_HEIGHT = 44;

/** How many pixels one day of a journey occupies when read at journey scale. */
const JOURNEY_DAY_HEIGHT = 118;

/**
 * Converts a span's duration into a length, in the units the caller is drawing
 * in, keeping the one-pixel floor so short spans stay visible.
 * @param {number} minutes - The span's duration
 * @param {number} minutesPerUnit - How many minutes one pixel represents
 * @returns {number} The span's drawn length in pixels
 */
function spanLength(minutes: number, minutesPerUnit: number): number {
  return Math.max(MINIMUM_SPAN_LENGTH, minutes / minutesPerUnit);
}

/**
 * Reads how tall a span's row is at journey scale. Long stays are drawn to
 * scale; anything shorter than a tappable row takes the row floor instead.
 * @param {LedgerSpan} span - The span being drawn
 * @returns {number} The row height in pixels
 */
export function rowHeight(span: LedgerSpan): number {
  const trueHeight = (span.minutes / (60 * 24)) * JOURNEY_DAY_HEIGHT;
  return Math.max(MINIMUM_ROW_HEIGHT, trueHeight);
}

/**
 * Reads how tall a span's tick is at journey scale. Unlike the row, the tick is
 * never floored beyond visibility, so it keeps telling the truth about a
 * ninety-minute layover sitting in a forty-four-pixel row.
 * @param {LedgerSpan} span - The span being drawn
 * @returns {number} The tick height in pixels
 */
export function tickHeight(span: LedgerSpan): number {
  return spanLength(span.minutes, (60 * 24) / JOURNEY_DAY_HEIGHT);
}

/**
 * Expresses a span as a percentage of the journey it belongs to, for bars that
 * are drawn in relative rather than absolute units.
 * @param {number} minutes - The span's duration
 * @param {number} totalMinutes - The journey's total duration
 * @returns {number} The span's share, as a percentage
 */
export function spanShare(minutes: number, totalMinutes: number): number {
  if (totalMinutes <= 0) return 0;
  return (minutes / totalMinutes) * 100;
}
