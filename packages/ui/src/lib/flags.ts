/**
 * Names the public URL of a country's flag. Flags are named by country code,
 * with `EU` for the European Union.
 * @param {string} countryId - The country's code
 * @returns {string} Its URL
 */
export function flagUrl(countryId: string): string {
  return `/flags/${countryId}.svg`;
}
