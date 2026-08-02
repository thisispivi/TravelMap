import { normalizeLocale } from "../locale";

const monthFormatters = new Map<string, Intl.DateTimeFormat>();
const weekdayFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Returns the cached abbreviated-month formatter for a locale.
 * @param {string} locale - The locale used to format month names
 * @returns {Intl.DateTimeFormat} The locale-specific month formatter
 */
function getMonthFormatter(locale: string): Intl.DateTimeFormat {
  const cached = monthFormatters.get(locale);
  if (cached) return cached;

  const formatter = Intl.DateTimeFormat(locale, { month: "short" });
  monthFormatters.set(locale, formatter);
  return formatter;
}

/**
 * Returns the cached abbreviated-weekday formatter for a locale.
 * @param {string} locale - The locale used to format weekday names
 * @returns {Intl.DateTimeFormat} The locale-specific weekday formatter
 */
function getWeekdayFormatter(locale: string): Intl.DateTimeFormat {
  const cached = weekdayFormatters.get(locale);
  if (cached) return cached;

  const formatter = Intl.DateTimeFormat(locale, { weekday: "short" });
  weekdayFormatters.set(locale, formatter);
  return formatter;
}

/**
 * Inputs used to format a compact date range.
 * @property {string | Date | null} [sDateInput] - The start date
 * @property {string | Date | null} [eDateInput] - The optional end date
 * @property {string} [locale] - The requested locale
 * @property {boolean} [includeWeekday] - Whether weekday labels are included
 * @property {boolean} [showYear] - Whether year labels are included
 */
type FormatDateRangeShortInput = {
  sDateInput?: string | Date | null;
  eDateInput?: string | Date | null;
  locale?: string;
  includeWeekday?: boolean;
  showYear?: boolean;
};

/**
 * Formats a start and optional end date as a compact localized range.
 * @param {FormatDateRangeShortInput} input - The date range formatting options
 * @param {string | Date | null} [input.sDateInput] - The start date
 * @param {string | Date | null} [input.eDateInput] - The optional end date
 * @param {string} [input.locale] - The requested locale
 * @param {boolean} [input.includeWeekday=false] - Whether weekdays are included
 * @param {boolean} [input.showYear=true] - Whether years are included
 * @returns {string} The compact localized date range
 */
export function formatDateRangeShort({
  sDateInput,
  eDateInput,
  locale,
  includeWeekday = false,
  showYear = true,
}: FormatDateRangeShortInput): string {
  if (!sDateInput) return "";
  const s = new Date(sDateInput);
  const e = eDateInput ? new Date(eDateInput) : null;

  const normalizedLocale = normalizeLocale(locale);

  /**
   * Gets the day of the month from a date.
   * @param {Date} date - The date to read
   * @returns {number} The day of the month
   */
  const day = (date: Date): number => date.getDate();
  const monthFormatter = getMonthFormatter(normalizedLocale);

  /**
   * Formats the localized month for a date.
   * @param {Date} date - The date to format
   * @returns {string} The localized abbreviated month
   */
  const monthFmt = (date: Date): string => monthFormatter.format(date);

  /**
   * Gets the full year from a date.
   * @param {Date} date - The date to read
   * @returns {number} The full year
   */
  const year = (date: Date): number => date.getFullYear();
  const weekdayFormatter = getWeekdayFormatter(normalizedLocale);

  /**
   * Formats the localized short weekday for a date.
   * @param {Date} date - The date to format
   * @returns {string} The localized three-character weekday
   */
  const weekdayFmt = (date: Date): string =>
    weekdayFormatter.format(date).slice(0, 3);

  /**
   * Formats a day with the optional localized weekday prefix.
   * @param {Date} date - The date to format
   * @returns {string} The formatted day label
   */
  const dayWithOptWeekday = (date: Date): string =>
    `${includeWeekday ? weekdayFmt(date) + " " : ""}${day(date)}`;

  /**
   * Formats a complete date using the caller's weekday and year options.
   * @param {Date} date - The date to format
   * @returns {string} The complete localized date
   */
  const fullDate = (date: Date): string =>
    `${dayWithOptWeekday(date)} ${monthFmt(date)}${showYear ? " " + year(date) : ""}`;

  if (!e) return fullDate(s).trim();

  if (s.getTime() === e.getTime()) return fullDate(s).trim();

  if (
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate()
  )
    return fullDate(s).trim();

  if (s.getFullYear() === e.getFullYear()) {
    if (s.getMonth() === e.getMonth()) {
      if (includeWeekday)
        return `${weekdayFmt(s)} ${day(s)} - ${weekdayFmt(e)} ${day(e)} ${monthFmt(s)}${showYear ? " " + year(s) : ""}`.trim();
      return `${day(s)}-${day(e)} ${monthFmt(s)}${showYear ? " " + year(s) : ""}`.trim();
    }
    return `${dayWithOptWeekday(s)} ${monthFmt(s)} - ${dayWithOptWeekday(e)} ${monthFmt(e)}${showYear ? " " + year(s) : ""}`.trim();
  }

  /**
   * Formats a complete date with its year for a cross-year range.
   * @param {Date} date - The date to format
   * @returns {string} The complete localized date including its year
   */
  const fullDateForceYear = (date: Date): string =>
    `${dayWithOptWeekday(date)} ${monthFmt(date)} ${year(date)}`;

  return `${fullDateForceYear(s)} - ${fullDateForceYear(e)}`.trim();
}
