import { Muravera } from "../data/Italy/Muravera/Muravera";

export const constants = {
  TOTAL_COUNTRIES: 195,
  TOTAL_UNESCO_SITES: 1223,
  EARTH_CIRCUMFERENCE: 40075,
  MOON_DISTANCE: 384400,
};

export const parameters = {
  isShowPhotos: true, // Used to show or hide the photos on the city card and not waste cdn bandwidth
  map: {
    defaultZoom: 4,
    defaultMinZoom: 1,
    defaultMaxZoom: 150,
    defaultCenter: [4, 48] as [number, number],
    hoveredCityZoom: 100,
    marker: {
      defaultScale: 0.15,
      minScale: 0.05,
      maxScale: 0.2,
    },
  },
  cdnPath: "https://pivi-travel-map.b-cdn.net/TravelMap/",
  birthCity: Muravera,
  stats: {
    unescoSites: 33,
  },
};
