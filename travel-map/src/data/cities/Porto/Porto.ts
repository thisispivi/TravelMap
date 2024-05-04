import { City, Travel } from "../../../core";
import { Portugal } from "../../countries/countries";

export const Porto = new City({
  name: "Porto",
  country: Portugal,
  coordinates: [-8.6291053, 41.1579438],
  travels: [
    new Travel({
      sDate: new Date(2024, 3, 19),
      eDate: new Date(2024, 3, 22),
      isFuture: false,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Porto.jpg",
  ],
});
