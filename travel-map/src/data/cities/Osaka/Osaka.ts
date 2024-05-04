import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";

export const Osaka = new City({
  name: "Osaka",
  country: Japan,
  coordinates: [135.5023, 34.6937],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 22),
      eDate: new Date(2024, 7, 22),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Osaka.jpg",
  ],
});
