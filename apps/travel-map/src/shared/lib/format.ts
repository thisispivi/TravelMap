import { normalizeLocale } from "@/i18n/locale";

const mileageFormatters = new Map<string, Intl.NumberFormat>();

/**
 * Returns a cached mileage formatter for a locale and precision.
 * @param {string} language - The requested language or locale
 * @param {number} digits - The maximum number of fractional digits
 * @returns {Intl.NumberFormat} The matching number formatter
 */
function getMileageFormatter(
  language: string,
  digits: number,
): Intl.NumberFormat {
  const locale = normalizeLocale(language);
  const key = `${locale}:${digits}`;
  const cached = mileageFormatters.get(key);
  if (cached) return cached;

  const formatter = Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
    useGrouping: true,
  });
  mileageFormatters.set(key, formatter);
  return formatter;
}

/**
 * Format the mileage number to a string with the given language and digits.
 * @param {number} mileage - The mileage number
 * @param {string} language - The language
 * @param {number} digits - The number of digits. Default is 2.
 * @returns {string} The formatted mileage
 */
export function formatMileage(
  mileage: number,
  language: string,
  digits: number = 2,
): string {
  return getMileageFormatter(language, digits).format(mileage);
}

/**
 * Formats minutes as a compact duration such as `2h 30m` or `45m`.
 * @param {number} minutes - The duration in minutes
 * @returns {string} The compact label
 */
export function formatDuration(minutes: number): string {
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
