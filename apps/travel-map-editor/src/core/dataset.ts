import {
  CityJson,
  Continent,
  CountryJson,
  Currency,
  Image,
  parseLocalDate,
  TripJson,
} from "@travelmap/core";

/**
 * A dataset file loaded by Vite and saved through the localhost middleware.
 * @property {string} path - Dataset-relative JSON path
 * @property {T} value - Parsed JSON value
 */
export interface DataFile<T> {
  path: string;
  value: T;
}

/**
 * A transport operator offered when authoring flight and ferry steps.
 * @property {string} name - Display name
 * @property {string} [logo] - Public logo path served by the site
 */
export interface Company {
  name: string;
  logo?: string;
}

/**
 * Site settings a fork owns without touching the public app's source.
 * @property {{ name?: string; domain?: string; description?: string; author?: string; keywords?: string[] }} [site] - Site metadata
 * @property {string[]} [locales] - Locales offered for translated names
 * @property {string | null} [homeCityId] - Home city reference
 * @property {string[]} [livedCityIds] - Former-home city references
 * @property {string[]} [futureCityIds] - Planned city references
 * @property {{ defaultZoom: number; defaultMinZoom: number; defaultMaxZoom: number; defaultCenter: [number, number]; hoveredCityZoom: number; marker: { defaultScale: number; minScale: number; maxScale: number } }} [map] - Map settings
 * @property {{ groupByCitiesCutoffYear: number }} [trips] - Trip display settings
 * @property {Record<string, string[]>} [unescoSites] - UNESCO site names by country
 * @property {Record<string, Company>} [companies] - Transport companies
 */
export interface SiteConfig {
  site?: {
    name?: string;
    domain?: string;
    description?: string;
    author?: string;
    keywords?: string[];
  };
  locales?: string[];
  homeCityId?: string | null;
  livedCityIds?: string[];
  futureCityIds?: string[];
  map?: {
    defaultZoom: number;
    defaultMinZoom: number;
    defaultMaxZoom: number;
    defaultCenter: [number, number];
    hoveredCityZoom: number;
    marker: { defaultScale: number; minScale: number; maxScale: number };
  };
  trips?: { groupByCitiesCutoffYear: number };
  unescoSites?: Record<string, string[]>;
  companies?: Record<string, Company>;
}

const DATA_PREFIX = "../../../../data/";

// A fork starts with no data/ at all, so every screen reads through this rather
// than assuming site.config.json already exists on disk.
const DEFAULT_CONFIG: SiteConfig = {
  companies: {},
  futureCityIds: [],
  homeCityId: null,
  livedCityIds: [],
  locales: [],
  map: {
    defaultCenter: [0, 20],
    defaultMaxZoom: 150,
    defaultMinZoom: 1,
    defaultZoom: 2,
    hoveredCityZoom: 100,
    marker: { defaultScale: 0.15, maxScale: 0.2, minScale: 0.05 },
  },
  site: { name: "Travel Map" },
  trips: { groupByCitiesCutoffYear: new Date().getFullYear() },
  unescoSites: {},
};

/**
 * Converts Vite's eager JSON modules into stable, editable data files.
 * @param {Record<string, { default: T }>} modules - Eager JSON modules
 * @returns {DataFile<T>[]} Files sorted by dataset path
 */
function files<T>(modules: Record<string, { default: T }>): DataFile<T>[] {
  return Object.entries(modules)
    .map(([path, { default: value }]) => ({
      path: path.replace(DATA_PREFIX, ""),
      value,
    }))
    .sort((first, second) => first.path.localeCompare(second.path));
}

export const countries = files<CountryJson>(
  import.meta.glob(
    ["../../../../data/*/*.json", "!../../../../data/trips/*.json"],
    {
      eager: true,
    },
  ),
);
export const cities = files<CityJson>(
  import.meta.glob("../../../../data/*/*/*.json", { eager: true }),
);
export const trips = files<TripJson>(
  import.meta.glob("../../../../data/trips/*.json", { eager: true }),
);
export const photos = files<Image[]>(
  import.meta.glob("../../../../data/photos/**/*.json", { eager: true }),
);

const configFile = files<SiteConfig>(
  import.meta.glob("../../../../data/site.config.json", { eager: true }),
)[0];

export const config: DataFile<SiteConfig> = configFile ?? {
  path: "site.config.json",
  value: DEFAULT_CONFIG,
};

export const photoPaths = photos.map(({ path }) =>
  path.replace(/^photos\//, "").replace(/\.json$/, ""),
);
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
 * Reads the locales a fork authors translations for.
 * @returns {string[]} Configured locale tags
 */
export function locales(): string[] {
  return config.value.locales ?? [];
}

/**
 * Lists company identifiers offered in transport steps.
 * @returns {string[]} Sorted company identifiers
 */
export function companyIds(): string[] {
  return Object.keys(config.value.companies ?? {}).sort();
}

// Vite serves the public app's logos from its own source tree, so the editor
// cannot reference /logos/*.svg the way the site does (the same reason
// world.ts keeps a parallel map for flags).
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

/**
 * Persists an authored JSON value using the local-only Vite middleware.
 * @param {string} path - Dataset-relative JSON path
 * @param {unknown} value - Serializable JSON value to persist
 * @returns {Promise<void>} Completion once the write is acknowledged
 */
export async function writeData(path: string, value: unknown): Promise<void> {
  const response = await fetch("/__data/write", {
    body: JSON.stringify({ path, value }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok)
    throw new Error(((await response.json()) as { error: string }).error);
}

/**
 * Removes an authored JSON file using the local-only Vite middleware.
 * @param {string} path - Dataset-relative JSON path
 * @returns {Promise<void>} Completion once the delete is acknowledged
 */
export async function deleteData(path: string): Promise<void> {
  const response = await fetch("/__data/delete", {
    body: JSON.stringify({ path }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok)
    throw new Error(((await response.json()) as { error: string }).error);
}

// Vite's eager globs are captured at module evaluation, so a created or deleted
// file only appears after a fresh document load. Navigating hard is simpler and
// more predictable than trying to patch the in-memory dataset.

/**
 * Reloads the editor at a route so new or removed files are picked up.
 * @param {string} path - Editor route to open after reloading
 * @returns {void}
 */
export function reloadAt(path: string): void {
  window.location.href = path;
}

/**
 * Builds the dataset path a country document is stored at.
 * @param {string} id - Country identifier
 * @returns {string} Dataset-relative JSON path
 */
export function countryPath(id: string): string {
  return `${id}/${id}.json`;
}

/**
 * Builds the dataset path a city document is stored at.
 * @param {string} countryId - Owning country identifier
 * @param {string} id - City identifier
 * @returns {string} Dataset-relative JSON path
 */
export function cityPath(countryId: string, id: string): string {
  return `${countryId}/${id}/${id}.json`;
}

/**
 * Builds the dataset path a trip document is stored at.
 * @param {string} id - Trip identifier
 * @returns {string} Dataset-relative JSON path
 */
export function tripPath(id: string): string {
  return `trips/${id}.json`;
}

// City ids become gallery URL segments and every id becomes a directory name, so
// anything outside this set would break routing or the filesystem layout.
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

/**
 * Explains why an identifier cannot be used, if it cannot.
 * @param {string} id - Proposed identifier
 * @param {string[]} taken - Identifiers already present in the dataset
 * @returns {string | null} Validation message, or null when the id is usable
 */
export function idError(id: string, taken: string[]): string | null {
  if (!id) return "An id is required.";
  if (!ID_PATTERN.test(id))
    return "Use letters, digits, hyphens, and underscores only.";
  if (taken.includes(id)) return `The id "${id}" is already used.`;
  return null;
}

/**
 * Validates every authored date on a trip before it can reach disk.
 * @param {TripJson} trip - Trip being saved
 * @returns {string[]} Human-readable date problems
 */
export function tripDateErrors(trip: TripJson): string[] {
  const errors: string[] = [];

  /**
   * Records a problem when a date is missing or unparseable.
   * @param {string | undefined} value - Authored date value
   * @param {string} label - Field name shown to the author
   * @param {boolean} isRequired - Whether an empty value is a problem
   * @returns {void}
   */
  function check(
    value: string | undefined,
    label: string,
    isRequired: boolean,
  ): void {
    if (!value) {
      if (isRequired) errors.push(`${label} is required.`);
      return;
    }
    try {
      parseLocalDate(value);
    } catch {
      errors.push(`${label} is not a valid date.`);
    }
  }

  check(trip.sDate, "Trip start", true);
  check(trip.eDate, "Trip end", true);
  trip.steps.forEach((step, index) => {
    const position = `Step ${index + 1}`;
    if (step.type === "stop") {
      check(step.sDate, `${position} start`, true);
      check(step.eDate, `${position} end`, true);
      return;
    }
    check(step.sDate, `${position} departure`, false);
    check(step.eDate, `${position} arrival`, false);
  });
  return errors;
}
