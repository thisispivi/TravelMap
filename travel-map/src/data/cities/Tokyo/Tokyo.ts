import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";
import { tr_130824_180824_images } from "./photos/tr_130824_180824";

export const Tokyo = new City({
  name: "Tokyo",
  country: Japan,
  coordinates: [139.6917, 35.6895],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 13),
      eDate: new Date(2024, 7, 18),
      isFuture: false,
      photos: tr_130824_180824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Tokyo.jpg",
  ],
});
