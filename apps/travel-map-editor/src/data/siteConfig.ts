/**
 * A transport operator offered when authoring flight and ferry legs.
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
 * @property {{ root: string }} [media] - Root baked into generated media paths
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
  media?: { root: string };
  unescoSites?: Record<string, string[]>;
  companies?: Record<string, Company>;
}

/** Complete map defaults used when an older config omits the map section. */
const DEFAULT_MAP_SETTINGS: NonNullable<SiteConfig["map"]> = {
  defaultCenter: [0, 20],
  defaultMaxZoom: 150,
  defaultMinZoom: 1,
  defaultZoom: 2,
  hoveredCityZoom: 100,
  marker: { defaultScale: 0.15, maxScale: 0.2, minScale: 0.05 },
};

/*
 * A fork starts with no data/ at all, so every screen reads through this rather
 * than assuming site.config.json already exists on disk.
 */
export const DEFAULT_CONFIG: SiteConfig = {
  companies: {},
  futureCityIds: [],
  homeCityId: null,
  livedCityIds: [],
  locales: [],
  map: DEFAULT_MAP_SETTINGS,
  media: { root: "/Travels" },
  site: { name: "Travel Map" },
  trips: { groupByCitiesCutoffYear: new Date().getFullYear() },
  unescoSites: {},
};

/**
 * Fills the map section for configs created before map settings were authored
 * in `site.config.json`.
 * @param {SiteConfig["map"]} map - Stored map settings, when present
 * @returns {NonNullable<SiteConfig["map"]>} A complete editable map section
 */
export function resolveMapSettings(
  map: SiteConfig["map"],
): NonNullable<SiteConfig["map"]> {
  return {
    ...DEFAULT_MAP_SETTINGS,
    ...map,
    marker: { ...DEFAULT_MAP_SETTINGS.marker, ...map?.marker },
  };
}
