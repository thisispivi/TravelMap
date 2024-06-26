import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";

export const Takayama = new City({
  name: "Takayama",
  country: Japan,
  coordinates: [137.2513, 36.1408],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 18),
      eDate: new Date(2024, 7, 19),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Takayama.jpg",
  ],
});
