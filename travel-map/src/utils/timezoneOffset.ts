import { City } from "@/core";

/**
 * Extracts calendar date/time parts for a given instant as seen in a specific IANA time zone.
 *
 * This uses Intl.DateTimeFormat with `formatToParts` to avoid locale-dependent parsing
 * and returns numeric components suitable for UTC reconstruction.
 *
 * @param {string} locale - BCP 47 locale identifier (e.g. "en-US")
 * @param {string} timeZone - IANA time zone id (e.g. "Europe/Rome")
 * @param {Date} date - The instant to be represented in the given time zone
 * @returns {{ year: number; month: number; day: number; hour: number; minute: number; second: number }} Calendar date/time parts in the target time zone
 */
function getDatePartsInTimeZone(locale: string, timeZone: string, date: Date) {
  const dtf = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(date);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") lookup[part.type] = part.value;
  }

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
  };
}

/**
 * Computes the time zone offset (in minutes) for a given instant in a specific IANA time zone.
 *
 * The offset is calculated by reconstructing a UTC timestamp from the wall-clock
 * representation of the instant in the target time zone.
 *
 * Positive values mean the time zone is ahead of UTC (e.g. UTC+2 → +120).
 *
 * @param {string} locale - BCP 47 locale identifier (e.g. "en-US")
 * @param {string} timeZone - IANA time zone id (e.g. "Europe/Rome")
 * @param {Date} instant - The instant for which to compute the offset
 * @returns {number} Offset from UTC in minutes
 */
export function getTimeZoneOffsetMinutes(
  locale: string,
  timeZone: string,
  instant: Date,
): number {
  const wall = getDatePartsInTimeZone(locale, timeZone, instant);
  const utcFromWall = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
  return Math.round((utcFromWall - instant.getTime()) / 60000);
}

/**
 * Converts a calendar date into a stable UTC instant at 12:00 UTC.
 *
 * This intentionally avoids local midnight to prevent DST transition issues
 * (e.g. missing or duplicated midnights).
 *
 * @param {Date} date - Date whose year/month/day should be preserved
 * @returns {Date} A Date representing 12:00 UTC on the same calendar day
 */
export function toUtcNoonOfCalendarDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0),
  );
}

/**
 * Returns the GMT offset (in minutes) for a city on a given calendar day.
 *
 * The date is treated as a calendar date, not a precise instant,
 * and is evaluated at UTC noon to ensure DST stability.
 *
 * @param {string} locale - BCP 47 locale identifier (e.g. "en-US")
 * @param {City} city - City containing an IANA time zone
 * @param {Date} calendarDate - Calendar day to evaluate
 * @returns {number} Offset from UTC in minutes
 */
export function getCityOffsetMinutesOnDate(
  locale: string,
  city: City,
  calendarDate: Date,
): number {
  return getTimeZoneOffsetMinutes(
    locale,
    city.timeZone,
    toUtcNoonOfCalendarDate(calendarDate),
  );
}

/**
 * Formats a GMT offset (in minutes) as `GMT±HH:MM`.
 *
 * @param {number} offsetMinutes - Offset from UTC in minutes
 * @returns {string} Formatted GMT offset string
 */
export function formatGmtOffsetFromMinutes(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `GMT${sign}${hh}:${mm}`;
}

/**
 * Formats a delta offset (in minutes) as `±HH:MM`.
 *
 * Used for expressing differences between two time zones.
 *
 * @param {number} deltaMinutes - Offset difference in minutes
 * @returns {string} Formatted delta string
 */
export function formatGmtOffsetDeltaFromMinutes(deltaMinutes: number): string {
  const sign = deltaMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(deltaMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}

/**
 * Ensures a date span is ordered chronologically.
 *
 * @param {Date} start - One end of the span
 * @param {Date} end - Other end of the span
 * @returns {{ start: Date; end: Date }} Ordered `{ start, end }`
 */
function clampDateSpan(start: Date, end: Date): { start: Date; end: Date } {
  return start.getTime() <= end.getTime()
    ? { start, end }
    : { start: end, end: start };
}

/**
 * Offset information for a city across a date span.
 */
export type TimeZoneSpanOffsets = {
  startOffsetMinutes: number;
  endOffsetMinutes: number;
  uniqueOffsetsMinutes: number[];
};

/**
 * Computes time zone offsets for a city across a calendar date span.
 *
 * Iterates day-by-day (evaluated at UTC noon) to detect DST changes.
 * For very large spans, it falls back to start/end offsets only.
 *
 * @param {string} locale - BCP 47 locale identifier (e.g. "en-US")
 * @param {City} city - City containing an IANA time zone
 * @param {Date} sDate - Start date (inclusive)
 * @param {Date} eDate - End date (inclusive)
 * @returns {TimeZoneSpanOffsets} Offset information for the span
 */
export function getCityOffsetsForDateSpan(
  locale: string,
  city: City,
  sDate: Date,
  eDate: Date,
): TimeZoneSpanOffsets {
  const { start, end } = clampDateSpan(sDate, eDate);

  const startOffsetMinutes = getCityOffsetMinutesOnDate(locale, city, start);
  const endOffsetMinutes = getCityOffsetMinutesOnDate(locale, city, end);

  const startUtcNoon = toUtcNoonOfCalendarDate(start);
  const endUtcNoon = toUtcNoonOfCalendarDate(end);
  const days =
    Math.floor((endUtcNoon.getTime() - startUtcNoon.getTime()) / 86400000) + 1;

  if (days > 5000) {
    const unique = Array.from(new Set([startOffsetMinutes, endOffsetMinutes]));
    unique.sort((a, b) => a - b);
    return {
      startOffsetMinutes,
      endOffsetMinutes,
      uniqueOffsetsMinutes: unique,
    };
  }

  const uniqueOffsets = new Set<number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    uniqueOffsets.add(getCityOffsetMinutesOnDate(locale, city, d));
  }

  const uniqueOffsetsMinutes = Array.from(uniqueOffsets).sort((a, b) => a - b);
  return { startOffsetMinutes, endOffsetMinutes, uniqueOffsetsMinutes };
}

/**
 * Formats the time difference between two cities across a date span.
 *
 * If the delta is constant, a single value is returned.
 * If it changes due to DST differences, a range is shown.
 *
 * @param {string} locale - BCP 47 locale identifier (e.g. "en-US")
 * @param {City} aCity - First city
 * @param {City} bCity - Second city
 * @param {Date} sDate - Start date
 * @param {Date} eDate - End date
 * @returns {string} Formatted delta string (e.g. `+01:00 → +02:00`)
 */
export function formatDeltaVsCityForDateSpan(
  locale: string,
  aCity: City,
  bCity: City,
  sDate: Date,
  eDate: Date,
): string {
  const a = getCityOffsetsForDateSpan(locale, aCity, sDate, eDate);
  const b = getCityOffsetsForDateSpan(locale, bCity, sDate, eDate);

  const startDelta = a.startOffsetMinutes - b.startOffsetMinutes;
  const endDelta = a.endOffsetMinutes - b.endOffsetMinutes;

  if (startDelta === endDelta)
    return formatGmtOffsetDeltaFromMinutes(startDelta);

  return `${formatGmtOffsetDeltaFromMinutes(startDelta)} → ${formatGmtOffsetDeltaFromMinutes(endDelta)}`;
}
