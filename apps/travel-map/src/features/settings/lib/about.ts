import { mediaUrl } from "@travelmap/core";
import { formatDateMedium } from "@travelmap/ui/i18n/date";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  SupportedLocale,
} from "@travelmap/ui/i18n/locale";

/* Forks keep crediting the upstream project unless they say otherwise. */
export const UPSTREAM_SOURCE_URL = "https://github.com/thisispivi/TravelMap";

/**
 * The first letters of a name's first and last words, for a picture that isn't
 * there.
 * @param {string} name - The name
 * @returns {string} One or two capital letters, or nothing for a blank name
 */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return [words[0], words.length > 1 ? words.at(-1) : undefined]
    .map((word) => (word ? Array.from(word)[0].toLocaleUpperCase() : ""))
    .join("");
}

/**
 * Resolves the authored avatar. `mediaUrl` would prefix an absolute URL with the
 * media host, so only a path goes through it.
 * @param {string} [avatar] - The authored media path or absolute URL
 * @returns {string | undefined} A browser-ready URL, or undefined when unset
 */
export function resolveAvatarUrl(avatar?: string): string | undefined {
  if (!avatar) return undefined;
  return /^https?:\/\//.test(avatar) ? avatar : mediaUrl(avatar);
}

/**
 * Website link and its visible text.
 * @property {string} href - Where the link goes
 * @property {string} host - The address without its protocol
 */
interface Website {
  href: string;
  host: string;
}

/**
 * Turns the authored website, or failing that the domain, into a link.
 * `site.domain` is usually a bare host, as the CNAME needs, but nothing stops a
 * fork pasting a whole address.
 * @param {string} [domain] - The authored website or domain
 * @returns {Website | undefined} The link, or undefined when neither is set
 */
export function websiteOf(domain?: string): Website | undefined {
  const host = domain
    ?.trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  return host ? { host, href: `https://${host}` } : undefined;
}

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
