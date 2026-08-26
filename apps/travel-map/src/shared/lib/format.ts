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
 * Formats a distance as whole kilometres. Every distance in the record is a
 * great-circle reading accurate to a few kilometres at best, so fractions of
 * one would claim a precision the data does not have.
 * @param {number} km - The distance in kilometres
 * @param {string} language - The language
 * @returns {string} The formatted distance with its unit
 */
export function formatDistance(km: number, language: string): string {
  return `${formatMileage(Math.round(km), language, 0)} km`;
}

/**
 * Formats a coordinate pair the way it is written on a chart, latitude first
 * with its hemisphere letter. One decimal place is roughly a ten-kilometre
 * square, which is as precise as a city coordinate meaningfully is.
 * @param {[number, number]} coordinates - The longitude and latitude
 * @returns {string} The formatted coordinates
 */
export function formatCoordinates(coordinates: [number, number]): string {
  const [longitude, latitude] = coordinates;
  const latitudeText = `${Math.abs(latitude).toFixed(1)}° ${latitude >= 0 ? "N" : "S"}`;
  const longitudeText = `${Math.abs(longitude).toFixed(1)}° ${longitude >= 0 ? "E" : "W"}`;
  return `${latitudeText}  ${longitudeText}`;
}
