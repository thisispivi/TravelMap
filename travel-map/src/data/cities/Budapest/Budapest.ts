import { City, Travel } from "../../../core";
import { Hungary } from "../../countries/countries";
import { tr_060523_090523_images } from "./photos/tr_060523_090523";

export const Budapest = new City({
  name: "Budapest",
  country: Hungary,
  coordinates: [19.040235, 47.497912],
  travels: [
    new Travel({
      sDate: new Date(2023, 4, 6),
      eDate: new Date(2023, 4, 9),
      photos: tr_060523_090523_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/Backgrounds/Cities/Budapest.jpg",
  ],
  mapCoordinates: [15.5, 47.5],
});
