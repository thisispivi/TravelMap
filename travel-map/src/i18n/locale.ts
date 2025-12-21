export const SUPPORTED_LOCALES = ["en-US", "it-IT"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en-US";

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * Normalize any user/detector-provided locale into one of the supported ones.
 *
 * Examples:
 * - `en`, `en-US`, `en_US`, `en-GB` -> `en-US`
 * - `it`, `it-IT`, `it_IT` -> `it-IT`
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
