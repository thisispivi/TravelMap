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
  digits: number = 2,
): string {
  return mileage.toLocaleString(language, { maximumFractionDigits: digits });
}
