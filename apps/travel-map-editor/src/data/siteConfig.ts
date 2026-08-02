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
