import { normalizeLocale } from "../locale";

const monthFormatters = new Map<string, Intl.DateTimeFormat>();
const weekdayFormatters = new Map<string, Intl.DateTimeFormat>();

function getMonthFormatter(locale: string) {
  const cached = monthFormatters.get(locale);
  if (cached) return cached;

  const formatter = Intl.DateTimeFormat(locale, { month: "short" });
  monthFormatters.set(locale, formatter);
  return formatter;
}

function getWeekdayFormatter(locale: string) {
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

  const day = (d: Date) => d.getDate();
  const monthFormatter = getMonthFormatter(normalizedLocale);
  const monthFmt = (d: Date) => monthFormatter.format(d);
  const year = (d: Date) => d.getFullYear();
  const weekdayFormatter = getWeekdayFormatter(normalizedLocale);
  const weekdayFmt = (d: Date) => weekdayFormatter.format(d).slice(0, 3);

  const dayWithOptWeekday = (d: Date) =>
    `${includeWeekday ? weekdayFmt(d) + " " : ""}${day(d)}`;
  const fullDate = (d: Date) =>
    `${dayWithOptWeekday(d)} ${monthFmt(d)}${showYear ? " " + year(d) : ""}`;

  if (!e) {
    return fullDate(s).trim();
  }

  if (s.getTime() === e.getTime()) {
    return fullDate(s).trim();
  }

  if (
    s.getFullYear() === e.getFullYear() &&
    s.getMonth() === e.getMonth() &&
    s.getDate() === e.getDate()
  ) {
    return fullDate(s).trim();
  }

  if (s.getFullYear() === e.getFullYear()) {
    if (s.getMonth() === e.getMonth()) {
      if (includeWeekday) {
        return `${weekdayFmt(s)} ${day(s)} - ${weekdayFmt(e)} ${day(e)} ${monthFmt(s)}${showYear ? " " + year(s) : ""}`.trim();
      }
      return `${day(s)}-${day(e)} ${monthFmt(s)}${showYear ? " " + year(s) : ""}`.trim();
    }
    return `${dayWithOptWeekday(s)} ${monthFmt(s)} - ${dayWithOptWeekday(e)} ${monthFmt(e)}${showYear ? " " + year(s) : ""}`.trim();
  }

  const fullDateForceYear = (d: Date) =>
    `${dayWithOptWeekday(d)} ${monthFmt(d)} ${year(d)}`;
  return `${fullDateForceYear(s)} - ${fullDateForceYear(e)}`.trim();
}
