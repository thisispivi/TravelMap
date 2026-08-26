const MINUTES_PER_DAY = 60 * 24;

/**
 * Writes a duration the way the record reads it: days once a span is long
 * enough for days to be the useful unit, hours and minutes below that. The
 * record never prints a bare decimal, because a reader counts nights, not
 * fractions of a day.
 * @param {number} minutes - The duration to write
 * @returns {string} The duration as a short reading
 */
export function writeDuration(minutes: number): string {
  if (minutes >= MINUTES_PER_DAY) {
    const days = Math.round(minutes / MINUTES_PER_DAY);
    return `${days}d`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${hours}h`;
  return `${hours}h ${rest}m`;
}

/**
 * Writes a span of time in whole hours, used by the figures where the unit is
 * fixed and the reader is comparing magnitudes rather than reading a clock.
 * @param {number} minutes - The duration to write
 * @returns {number} The duration in whole hours
 */
export function toHours(minutes: number): number {
  return Math.round(minutes / 60);
}
