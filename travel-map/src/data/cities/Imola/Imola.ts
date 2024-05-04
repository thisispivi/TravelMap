import { City, Travel } from "../../../core";
import { Italy } from "../../countries/countries";
import { tr_220422_250422_images } from "./photos/tr_220422_250422";

export const Imola = new City({
  name: "Imola",
  country: Italy,
  coordinates: [11.716667, 44.35],
  travels: [
    new Travel({
      sDate: new Date(2022, 3, 22),
      eDate: new Date(2022, 3, 25),
      photos: tr_220422_250422_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Imola.jpg",
  ],
});
