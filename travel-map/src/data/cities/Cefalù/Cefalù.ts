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
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/5ea882d78f6bbf7cfc8626444ecd70951a4770a1/Backgrounds/Cities/Cefalu.jpg",
  ],
});
