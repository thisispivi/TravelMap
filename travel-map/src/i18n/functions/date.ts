import { i18n } from "i18next";
import { normalizeLocale } from "../locale";

/**
 * Format a date based on the language
 *
 * @param {Date|undefined} date - The date to format
 * @param {i18n["language"]} lang - The language to format the date
 *
 * @returns {string} - The formatted date
 */
export function formatDate(
  date: Date | undefined,
  lang: i18n["language"]
): string {
  if (!date) return "No date";

  const locale = normalizeLocale(lang);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  return formattedDate;
}

/**
 * Format a date based on the language
 *
 * @param {Date|undefined} date - The date to format
 * @param {i18n["language"]} lang - The language to format the date
 *
 * @returns {string} - The formatted date
 */
export function formatDateMonthYear(
  date: Date | undefined,
  lang: i18n["language"]
): string {
  if (!date) return "No date";

  const locale = normalizeLocale(lang);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);

  return formattedDate;
}

type FormatDateRangeShortInput = {
  sDateInput?: string | Date | null;
  eDateInput?: string | Date | null;
  locale?: string;
  includeWeekday?: boolean;
  showYear?: boolean;
};
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
  const monthFmt = (d: Date) =>
    new Intl.DateTimeFormat(normalizedLocale, { month: "short" }).format(d);
  const year = (d: Date) => d.getFullYear();
  const weekdayFmt = (d: Date) =>
    new Intl.DateTimeFormat(normalizedLocale, { weekday: "short" })
      .format(d)
      .slice(0, 3);

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

  if (s.getFullYear() === e.getFullYear()) {
    if (s.getMonth() === e.getMonth()) {
      if (includeWeekday) {
        return `${weekdayFmt(s)} ${day(s)} - ${weekdayFmt(e)} ${day(e)} ${monthFmt(s)}${showYear ? " " + year(s) : ""}`.trim();
      }
      return `${day(s)}-${day(e)} ${monthFmt(s)}${showYear ? " " + year(s) : ""}`.trim();
    }
    return `${dayWithOptWeekday(s)} ${monthFmt(s)} - ${dayWithOptWeekday(e)} ${monthFmt(e)}${showYear ? " " + year(s) : ""}`.trim();
  }

  return `${fullDate(s)} - ${fullDate(e)}`.trim();
}
