import type { SiteConfig } from "@travelmap/core";

export type { Company, SiteConfig } from "@travelmap/core";

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
