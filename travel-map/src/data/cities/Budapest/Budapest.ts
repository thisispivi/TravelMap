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
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Budapest.jpg",
  ],
});
