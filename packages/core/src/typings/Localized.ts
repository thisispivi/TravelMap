/**
 * A value with a canonical display name and optional locale-specific overrides.
 * @property {string} name - The canonical display name
 * @property {Record<string, string>} [nameByLocale] - Display names keyed by locale
 */
export interface Localized {
  name: string;
  nameByLocale?: Record<string, string>;
}

/**
 * Selects a localized name while retaining the canonical name as the reliable fallback.
 * @param {Localized} value - The value to localize
 * @param {string} locale - The requested locale
 * @returns {string} The localized or canonical name
 */
export function localize(value: Localized, locale: string): string {
  const { name, nameByLocale } = value;
  return nameByLocale?.[locale] ?? name;
}
