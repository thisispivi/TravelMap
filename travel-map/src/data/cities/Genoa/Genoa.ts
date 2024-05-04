import { City, Travel } from "../../../core";
import { Italy } from "../../countries/countries";
import { tr_141123_141123_images } from "./photos/tr_141123_141123";

export const Genoa = new City({
  name: "Genoa",
  country: Italy,
  coordinates: [8.946256, 44.4056499],
  travels: [
    new Travel({
      sDate: new Date(2023, 10, 14),
      eDate: new Date(2023, 10, 14),
      photos: tr_141123_141123_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Genoa.jpg",
  ],
});
