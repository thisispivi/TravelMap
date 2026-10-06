const LOCAL_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/;

/**
 * Parses a naive date as local wall-clock time instead of UTC midnight.
 * @param {string} value - A YYYY-MM-DD or YYYY-MM-DDTHH:mm local date
 * @returns {Date} The corresponding local Date
 */
export function parseLocalDate(value: string): Date {
  const match = LOCAL_DATE.exec(value);

  if (!match) throw new Error(`Invalid local date: ${value}`);

  const [, year, month, day, hours = "00", minutes = "00"] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
  );

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date.getHours() !== Number(hours) ||
    date.getMinutes() !== Number(minutes)
  ) {
    throw new Error(`Invalid local date: ${value}`);
  }

  return date;
}

/**
 * Formats a local Date without introducing a timezone conversion.
 * @param {Date} date - The local date to format
 * @returns {string} A YYYY-MM-DD or YYYY-MM-DDTHH:mm value
 */
export function formatLocalDate(date: Date): string {
  const datePart = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");

  if (date.getHours() === 0 && date.getMinutes() === 0) return datePart;

  return `${datePart}T${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

/**
 * Reads the field values of an authored local date as a UTC instant, so date
 * arithmetic never depends on the time zone of the machine doing it.
 * @param {string} value - A YYYY-MM-DD or YYYY-MM-DDTHH:mm local date
 * @returns {number} Milliseconds since the epoch for those fields read as UTC
 */
function wallClockAsUtc(value: string): number {
  const match = LOCAL_DATE.exec(value);
  if (!match) throw new Error(`Invalid local date: ${value}`);
  const [, year, month, day, hours = "00", minutes = "00"] = match;
  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
  );
}

/**
 * Measures how far a zone's wall clock is ahead of UTC at an instant.
 * @param {number} instant - Milliseconds since the epoch
 * @param {string} timeZone - IANA time zone name
 * @returns {number} The offset in milliseconds
 */
function zoneOffset(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    hourCycle: "h23",
    minute: "numeric",
    month: "numeric",
    timeZone,
    year: "numeric",
  }).formatToParts(instant);

  /**
   * Reads one numeric field of the formatted wall clock.
   * @param {Intl.DateTimeFormatPartTypes} type - The field
   * @returns {number} Its value
   */
  const field = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value);
  return (
    Date.UTC(
      field("year"),
      field("month") - 1,
      field("day"),
      field("hour"),
      field("minute"),
    ) - instant
  );
}

/**
 * Converts a wall-clock time in a city to the instant it happened. The offset
 * is read twice because the first guess can land on the other side of a clock
 * change; a time skipped by a spring-forward resolves to the later offset.
 * @param {string} value - A YYYY-MM-DDTHH:mm local date
 * @param {string} timeZone - The IANA zone of the city the clock hangs in
 * @returns {number} Milliseconds since the epoch
 */
export function zonedInstant(value: string, timeZone: string): number {
  const wallClock = wallClockAsUtc(value);
  const guess = wallClock - zoneOffset(wallClock, timeZone);
  return wallClock - zoneOffset(guess, timeZone);
}

/**
 * Reports whether an authored local date carries a time of day.
 * @param {string} [value] - The authored date
 * @returns {boolean} Whether it has an HH:mm part
 */
export function hasTime(value?: string): value is string {
  return value?.includes("T") ?? false;
}

/**
 * Measures a journey from two wall-clock times read in their own cities, which
 * is the only honest reading of a timetable that crosses time zones.
 * @param {string} depart - Departure, local to the departure city
 * @param {string} departZone - IANA zone of the departure city
 * @param {string} arrive - Arrival, local to the arrival city
 * @param {string} arriveZone - IANA zone of the arrival city
 * @returns {number | undefined} Minutes travelled, or undefined without times
 */
export function zonedDurationMinutes(
  depart: string,
  departZone: string,
  arrive: string,
  arriveZone: string,
): number | undefined {
  if (!hasTime(depart) || !hasTime(arrive)) return undefined;
  return Math.round(
    (zonedInstant(arrive, arriveZone) - zonedInstant(depart, departZone)) /
      MINUTE_MS,
  );
}

/**
 * Counts the calendar days from one date to another, ignoring any time part.
 * @param {string} from - The earlier local date
 * @param {string} to - The later local date
 * @returns {number} Whole days between them, negative when `to` is earlier
 */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (wallClockAsUtc(to.slice(0, 10)) - wallClockAsUtc(from.slice(0, 10))) /
      DAY_MS,
  );
}

/**
 * Moves a calendar date by a number of days.
 * @param {string} date - A YYYY-MM-DD date, any time part is dropped
 * @param {number} days - Days to add, negative to go back
 * @returns {string} The shifted YYYY-MM-DD date
 */
export function addDays(date: string, days: number): string {
  return new Date(wallClockAsUtc(date.slice(0, 10)) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}
