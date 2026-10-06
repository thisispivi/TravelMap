import { City } from "@travelmap/core";

import { homeCity, siteConfig } from "@/data/world";

/**
 * Constants and parameters used throughout the application.
 * @property {number} TOTAL_CONTINENTS - The total number of continents
 * @property {number} TOTAL_COUNTRIES - The total number of countries
 * @property {number} TOTAL_UNESCO_SITES - The total number of UNESCO sites
 * @property {number} EARTH_CIRCUMFERENCE - The circumference of the Earth in kilometers
 * @property {number} MOON_DISTANCE - The average distance to the Moon in kilometers
 * @property {number} GROUP_BY_CITIES_CUTOFF_YEAR - The cutoff year for grouping trips by cities
 * @property {number} GROUP_BY_CITIES_DEFAULT_OPENED_YEAR - The default year for opening grouped trips by cities
 */
export const constants = {
  TOTAL_CONTINENTS: 7,
  TOTAL_COUNTRIES: 195,
  TOTAL_UNESCO_SITES: 1248,
  EARTH_CIRCUMFERENCE: 40075,
  MOON_DISTANCE: 384400,
  GROUP_BY_CITIES_CUTOFF_YEAR:
    siteConfig?.trips?.groupByCitiesCutoffYear ?? 2022,
  GROUP_BY_CITIES_DEFAULT_OPENED_YEAR: new Date().getFullYear(),
};

/**
 * Parameters used throughout the application.
 * @property {boolean} isShowPhotos - Whether to show photos on the city card
 * @property {{ defaultZoom: number; defaultMinZoom: number; defaultMaxZoom: number; defaultCenter: [number, number]; hoveredCityZoom: number; marker: { defaultScale: number; minScale: number; maxScale: number } }} map - Map configuration
 * @property {City | null} homeCity - The home city
 * @property {{ unescoSites: Record<string, string[]> }} stats - Statistics and metadata
 */
type Parameters = {
  isShowPhotos: boolean;
  map: {
    defaultZoom: number;
    defaultMinZoom: number;
    defaultMaxZoom: number;
    defaultCenter: [number, number];
    hoveredCityZoom: number;
    marker: { defaultScale: number; minScale: number; maxScale: number };
  };
  homeCity: City | null;
  stats: { unescoSites: Record<string, string[]> };
};

export const parameters: Parameters = {
  isShowPhotos: true,
  map: siteConfig?.map ?? {
    defaultZoom: 2,
    defaultMinZoom: 1,
    defaultMaxZoom: 150,
    defaultCenter: [0, 20] as [number, number],
    hoveredCityZoom: 100,
    marker: { defaultScale: 0.15, minScale: 0.05, maxScale: 0.2 },
  },
  homeCity,
  stats: { unescoSites: siteConfig?.unescoSites ?? {} },
};
