import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";

export const Nara = new City({
  name: "Nara",
  country: Japan,
  coordinates: [135.8048, 34.6851],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 23),
      eDate: new Date(2024, 7, 23),
      isFuture: false,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Nara.jpg",
  ],
});
