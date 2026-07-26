/**
 * Locales supported by the application.
 */
export const SUPPORTED_LOCALES = ["en-US", "it-IT"] as const;

/**
 * A locale supported by the application.
 */
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * The fallback locale used when a requested locale is unsupported.
 */
export const DEFAULT_LOCALE: SupportedLocale = "en-US";

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * Examples:
 * - `en`, `en-US`, `en_US`, `en-GB` -> `en-US`
 * - `it`, `it-IT`, `it_IT` -> `it-IT`
 * @param {string | null} [input] - The locale supplied by the user or detector
 * @returns {SupportedLocale} A supported application locale
 */
export function normalizeLocale(input?: string | null): SupportedLocale {
  const raw = (input ?? "").trim();
  if (!raw) return DEFAULT_LOCALE;

  const normalized = raw.replace("_", "-");

  if (isSupportedLocale(normalized)) return normalized;

  const lower = normalized.toLowerCase();
  if (lower.startsWith("it")) return "it-IT";
  if (lower.startsWith("en")) return "en-US";

  return DEFAULT_LOCALE;
}
