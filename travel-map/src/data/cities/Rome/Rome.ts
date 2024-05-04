import { City, Travel } from "../../../core";
import { Italy } from "../../countries/countries";
import { tr_270721_030821_images } from "./photos/tr_270721_030821";

export const Rome = new City({
  name: "Rome",
  country: Italy,
  coordinates: [12.4963655, 41.9027835],
  travels: [
    new Travel({
      sDate: new Date(2021, 6, 27),
      eDate: new Date(2021, 7, 3),
      photos: tr_270721_030821_images,
    }),
    new Travel({
      sDate: new Date(2024, 7, 10),
      eDate: new Date(2024, 7, 12),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Rome.jpg",
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/2623cbbef6f2286b5c7461fd37a2cef0d0b0e1a1/Backgrounds/Cities/Rome-1.jpg",
  ],
});
