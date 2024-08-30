import { City, Travel } from "../../../core";
import { Italy } from "../../countries/countries";
import { tr_230921_260921_images } from "./photos/tr_230921_260921";

export const Cefalù = new City({
  name: "Cefalù",
  country: Italy,
  coordinates: [13.988, 38.0342],
  travels: [
    new Travel({
      sDate: new Date(2021, 8, 23),
      eDate: new Date(2021, 8, 26),
      photos: tr_230921_260921_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/Backgrounds/Cities/Cefalu.jpg",
  ],
});
