/*
 * Company logos live in the forkable dataset rather than the app's public
 * folder, so a fork owns its own operators. They are bundled by filename here
 * because `data/` is outside the app root and never served as static assets.
 */
const logoUrls = import.meta.glob<string>(
  ["../../../../data/logos/*.svg", "../../../../data/logos/*.png"],
  { eager: true, import: "default", query: "?url" },
);
const logosByFilename = new Map(
  Object.entries(logoUrls).map(([path, url]) => [
    path.slice(path.lastIndexOf("/") + 1),
    url,
  ]),
);

/**
 * Resolves a company's authored `/logos/<file>` path to its bundled URL.
 * @param {string} [logo] - The authored logo path
 * @returns {string | undefined} A browser-ready URL, or undefined when unset or missing
 */
export function resolveLogoUrl(logo?: string): string | undefined {
  if (!logo) return undefined;
  return logosByFilename.get(logo.slice(logo.lastIndexOf("/") + 1));
}
