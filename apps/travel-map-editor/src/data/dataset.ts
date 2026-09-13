import { mediaUrl, TransportModeSchema } from "@travelmap/core";

import { isSafeImageUrl } from "./imageUrl";
import { DatasetSnapshot, getDataset } from "./store";

export const transportModes = TransportModeSchema.options;

/**
 * Lists the gallery manifest keys a trip stop can reference, which are the
 * photo paths with their `photos/` prefix and `.json` suffix removed.
 * @param {DatasetSnapshot} dataset - The current dataset
 * @returns {string[]} Referenceable manifest keys
 */
export function photoKeys(dataset: DatasetSnapshot): string[] {
  return dataset.photos.map(({ path }) =>
    path.replace(/^photos\//, "").replace(/\.json$/, ""),
  );
}

/**
 * Reads the locales a fork authors translations for.
 * @returns {string[]} Configured locale tags
 */
export function locales(): string[] {
  return getDataset().config.value.locales ?? [];
}

/*
 * Logos live in the dataset, outside either app's served root, so both apps
 * bundle them by filename rather than linking /logos/*.svg directly (the same
 * reason worldCountries.ts keeps a parallel map for flags).
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
 * Resolves a company's stored `/logos/<file>` path to a URL the editor's own
 * dev server can actually load, falling back to the stored path unresolved
 * when the file isn't in the editor's module graph (for instance, immediately
 * after an upload, before the next reload picks it up).
 * @param {string} [logo] - The stored public logo path
 * @returns {string | undefined} A URL the editor can load
 */
export function resolveLogoUrl(logo?: string): string | undefined {
  if (!logo) return undefined;
  const bundled = logosByFilename.get(logo.slice(logo.lastIndexOf("/") + 1));
  if (bundled) return bundled;
  return isSafeImageUrl(logo) ? logo : undefined;
}

/**
 * Resolves an authored media path against the public site's CDN while leaving
 * absolute URLs intact.
 * @param {string} [path] - Authored cover or city image path
 * @returns {string | undefined} A browser-ready image URL
 */
export function resolveMediaUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (!isSafeImageUrl(path)) return undefined;
  if (/^(?:https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return mediaUrl(path);
}
