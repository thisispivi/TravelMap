/**
 * Format the mileage number to a string with the given language and digits.
 * @param {number} mileage - The mileage number
 * @param {string} language - The language
 * @param {number} digits - The number of digits. Default is 2.
 * @returns {string} - The formatted mileage
 */
export function formatMileage(
  mileage: number,
  language: string,
  digits: number = 2
): string {
  return mileage.toLocaleString(language, { maximumFractionDigits: digits });
}

/**
 * Format a date range to a short string.
 * @param {string | Date | null} sDateInput - The start date input
 * @param {string | Date | null} eDateInput - The end date input
 * @param {string} [locale="en"] - The locale for formatting
 * @returns {string} - The formatted date range string
 * @example
 * formatDateRangeShort("2025-03-04", "2025-03-06", "en"); // "4 mar - 6 mar 2025"
 * formatDateRangeShort("2025-03-04", null, "en"); // "4 mar 2025"
 * formatDateRangeShort("2024-12-30", "2025-01-02", "en"); // "30 dec 2024 - 2 jan 2025"
 * formatDateRangeShort("2025-03-04", "2025-03-04", "en"); // "4 mar 2025"
 * formatDateRangeShort("2025-03-04", "2025-03-05", "en"); // "4 mar - 5 mar 2025"
 * formatDateRangeShort("2025-03-04", "2025-04-02", "en"); // "4 mar 2025 - 2 apr 2025"
 */
export function formatDateRangeShort(
  sDateInput?: string | Date | null,
  eDateInput?: string | Date | null,
  locale: string = "en"
): string {
  if (!sDateInput) return "";
  const s = new Date(sDateInput);
  const e = eDateInput ? new Date(eDateInput) : null;

  const day = (d: Date) => d.getDate();
  const monthFmt = (d: Date) =>
    new Intl.DateTimeFormat(locale, { month: "short" }).format(d).toLowerCase();
  const year = (d: Date) => d.getFullYear();

  if (!e) {
    return `${day(s)} ${monthFmt(s)} ${year(s)}`;
  }

  if (s.getTime() === e.getTime()) {
    return `${day(s)} ${monthFmt(s)} ${year(s)}`;
  }

  if (s.getFullYear() === e.getFullYear()) {
    if (s.getMonth() === e.getMonth()) {
      return `${day(s)}-${day(e)} ${monthFmt(s)} ${year(s)}`;
    }
    return `${day(s)} ${monthFmt(s)} - ${day(e)} ${monthFmt(e)} ${year(s)}`;
  }

  return `${day(s)} ${monthFmt(s)} ${year(s)} - ${day(e)} ${monthFmt(e)} ${year(e)}`;
}
