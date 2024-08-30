import { City, Travel } from "../../../core";
import { Portugal } from "../../countries/countries";
import { tr_190424_220424_images } from "./photos/tr_190424_220424";

export const Porto = new City({
  name: "Porto",
  country: Portugal,
  coordinates: [-8.6291053, 41.1579438],
  travels: [
    new Travel({
      sDate: new Date(2024, 3, 19),
      eDate: new Date(2024, 3, 22),
      isFuture: false,
      photos: tr_190424_220424_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/Backgrounds/Cities/Porto.jpg",
  ],
});
