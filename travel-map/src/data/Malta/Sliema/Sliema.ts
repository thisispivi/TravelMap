import { City, Travel } from "../../../core";
import { Malta } from "../Malta";

export const Sliema = new City({
  name: "Sliema",
  country: Malta,
  coordinates: [14.5014, 35.9122],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 1),
      eDate: new Date(2025, 0, 5),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Sliema.jpg",
  ],
  mapCoordinates: [10.9, 36.1],
});
