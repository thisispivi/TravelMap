import { Continent, Currency } from "@travelmap/core";

import { DatasetSnapshot, getDataset } from "./store";

export const continents = Object.values(Continent);
export const currencies = Object.values(Currency);
export const transportModes = [
  "plane",
  "ferry",
  "car",
  "train",
  "bus",
  "taxi",
  "walk",
] as const;

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

/**
 * Lists company identifiers offered in transport steps.
 * @returns {string[]} Sorted company identifiers
 */
export function companyIds(): string[] {
  return Object.keys(getDataset().config.value.companies ?? {}).sort();
}

/*
 * Vite serves the public app's logos from its own source tree, so the editor
 * cannot reference /logos/*.svg the way the site does (the same reason
 * worldCountries.ts keeps a parallel map for flags).
 */
const logoUrls = import.meta.glob<string>(
  [
    "../../../travel-map/public/logos/*.svg",
    "../../../travel-map/public/logos/*.png",
  ],
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
  return logosByFilename.get(logo.slice(logo.lastIndexOf("/") + 1)) ?? logo;
}
