import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";
import { tr_230824_230824_images } from "./photos/tr_230824_230824";

export const Kobe = new City({
  name: "Kobe",
  country: Japan,
  coordinates: [135.1955, 34.6901],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 23),
      eDate: new Date(2024, 7, 23),
      isFuture: false,
      photos: tr_230824_230824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/34b01ca98aecc070663a73d83e0720701e88b8a1/Backgrounds/Cities/Kobe.jpg",
  ],
});
