export type ParametersType = {
  isShowPhotos: boolean;
  map: {
    defaultZoom: number;
    defaultMinZoom: number;
    defaultMaxZoom: number;
    defaultCenter: [number, number];
    hoveredCityZoom: number;
    marker: {
      defaultScale: number;
      minScale: number;
      maxScale: number;
    };
  };
};

export const parameters: ParametersType = {
  isShowPhotos: true, // Used to show or hide the photos on the city card and not waste cdn bandwidth
  map: {
    defaultZoom: 5,
    defaultMinZoom: 1,
    defaultMaxZoom: 150,
    defaultCenter: [7, 49],
    hoveredCityZoom: 100,
    marker: {
      defaultScale: 0.15,
      minScale: 0.05,
      maxScale: 0.2,
    },
  },
};
