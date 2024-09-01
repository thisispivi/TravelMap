import { City, Travel } from "../../../core";
import { Italy } from "../../countries/countries";
import { tr_270122_270122_images } from "./photos/tr_270122_270122";

export const Terni = new City({
  name: "Terni",
  country: Italy,
  coordinates: [12.6411, 42.5635],
  travels: [
    new Travel({
      sDate: new Date(2022, 1, 27),
      eDate: new Date(2022, 1, 27),
      photos: tr_270122_270122_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Terni.jpg",
  ],
  mapCoordinates: [9.5, 42.5],
});
