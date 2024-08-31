const isShowPhotos = false; // Used in dev mode to not show photos
const defaultMapZoom = 5;
const defaultMapMinZoom = 1;
const defaultMapMaxZoom = 30;
const defaultMapCenter: [number, number] = [7, 49];

export const parameters = {
  isShowPhotos,
  map: {
    defaultZoom: defaultMapZoom,
    defaultMinZoom: defaultMapMinZoom,
    defaultMaxZoom: defaultMapMaxZoom,
    defaultCenter: defaultMapCenter,
  },
};
