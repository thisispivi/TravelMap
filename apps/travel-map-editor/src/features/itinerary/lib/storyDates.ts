import { formatDateRangeShort } from "@app/i18n/functions/date";
import { parseLocalDate } from "@travelmap/core";

/**
 * Formats a day or a range of days with weekdays — `Fri 27 Mar` or
 * `Thu 26 – Mon 30 Mar` — the way the public trip page dates its chapters, so
 * the editor and the site label a chapter identically.
 * @param {string} from - The first date, any time part ignored
 * @param {string} to - The last date, any time part ignored
 * @param {string} locale - The active locale
 * @returns {string} The localized label, with a capital first letter
 */
export function formatStoryDays(
  from: string,
  to: string,
  locale: string,
): string {
  const label = formatDateRangeShort({
    eDateInput:
      to.slice(0, 10) === from.slice(0, 10)
        ? undefined
        : parseLocalDate(to.slice(0, 10)),
    includeWeekday: true,
    locale,
    sDateInput: parseLocalDate(from.slice(0, 10)),
    showYear: false,
  });
  return label.charAt(0).toLocaleUpperCase() + label.slice(1);
}
