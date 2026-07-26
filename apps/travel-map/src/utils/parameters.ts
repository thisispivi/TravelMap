import { homeCity, siteConfig } from "@/data";

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

export const parameters = {
  isShowPhotos: true, // Used to show or hide the photos on the city card and not waste cdn bandwidth
  map: siteConfig?.map ?? {
    defaultZoom: 2,
    defaultMinZoom: 1,
    defaultMaxZoom: 150,
    defaultCenter: [0, 20] as [number, number],
    hoveredCityZoom: 100,
    marker: { defaultScale: 0.15, minScale: 0.05, maxScale: 0.2 },
  },
  homeCity,
  stats: {
    unescoSites: siteConfig?.unescoSites ?? {},
  },
};
