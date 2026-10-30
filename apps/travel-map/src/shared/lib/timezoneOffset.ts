import { City } from "@travelmap/core";

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Returns a cached formatter for calendar parts in a specific time zone.
 * @param {string} locale - The locale used by the formatter
 * @param {string} timeZone - The IANA time zone represented by the formatter
 * @returns {Intl.DateTimeFormat} The matching date-time formatter
 */
function getDateTimeFormatter(
  locale: string,
  timeZone: string,
): Intl.DateTimeFormat {
  const key = `${locale}:${timeZone}`;
  const cached = dateTimeFormatters.get(key);
  if (cached) return cached;

  const formatter = Intl.DateTimeFormat(locale, {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  dateTimeFormatters.set(key, formatter);
  return formatter;
}

/**
 * This uses Intl.DateTimeFormat with `formatToParts` to avoid locale-dependent parsing
 * and returns numeric components suitable for UTC reconstruction.
 * @param {string} locale - BCP 47 locale identifier (e.g. "en-US")
 * @param {string} timeZone - IANA time zone id (e.g. "Europe/Rome")
 * @param {Date} date - The instant to be represented in the given time zone
 * @returns {{ year: number; month: number; day: number; hour: number; minute: number; second: number }} Calendar date/time parts in the target time zone
 */
function getDatePartsInTimeZone(locale: string, timeZone: string, date: Date) {
  const parts = getDateTimeFormatter(locale, timeZone).formatToParts(date);
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
 * Positive values mean the time zone is ahead of UTC (e.g. UTC+2 → +120).
 * @param {string} locale - BCP 47 locale identifier (e.g. "en-US")
 * @param {string} timeZone - IANA time zone id (e.g. "Europe/Rome")
 * @param {Date} instant - The instant for which to compute the offset
 * @returns {number} Offset from UTC in minutes
 */
function getTimeZoneOffsetMinutes(
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
 * This intentionally avoids local midnight to prevent DST transition issues
 * (e.g. missing or duplicated midnights).
 * @param {Date} date - Date whose year/month/day should be preserved
 * @returns {Date} A Date representing 12:00 UTC on the same calendar day
 */
function toUtcNoonOfCalendarDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0),
  );
}

/**
 * The date is treated as a calendar date, not a precise instant,
 * and is evaluated at UTC noon to ensure DST stability.
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
