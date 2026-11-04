import { formatDateMedium } from "@travelmap/ui/i18n/date";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  SupportedLocale,
} from "@travelmap/ui/i18n/locale";

/**
 * Lists the languages to offer: the default, plus those the site configuration
 * lists that have translations; every one when it lists none at all. The active
 * language stays in the list, or no option would show as selected.
 * @param {string[] | undefined} configured - The `locales` of the site configuration
 * @param {SupportedLocale} current - The active language
 * @returns {SupportedLocale[]} The languages, in their usual order
 */
export function offeredLocales(
  configured: string[] | undefined,
  current: SupportedLocale,
): SupportedLocale[] {
  if (!configured) return [...SUPPORTED_LOCALES];
  return SUPPORTED_LOCALES.filter(
    (locale) =>
      locale === DEFAULT_LOCALE ||
      locale === current ||
      configured.includes(locale),
  );
}

/**
 * Build facts the About section prints.
 * @property {string} version - The package version
 * @property {string} [commit] - The short commit, when it was known
 * @property {string} date - The build's ISO instant
 */
interface BuildInfo {
  version: string;
  commit?: string;
  date: string;
}

/**
 * Writes the line naming this build, leaving out a commit nobody knows.
 * @param {BuildInfo} build - What was built
 * @param {string} build.version - The package version
 * @param {string} [build.commit] - The short commit, when it was known
 * @param {string} build.date - The build's ISO instant
 * @param {string} locale - The language for the date
 * @returns {string} Such as `v1.0.0 · abc1234 · 1 Nov 2026`
 */
export function formatBuildLine(
  { version, commit, date }: BuildInfo,
  locale: string,
): string {
  return [`v${version}`, commit, formatDateMedium(date, locale)]
    .filter(Boolean)
    .join(" · ");
}
