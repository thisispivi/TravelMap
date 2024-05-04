import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";

export const Shirawakago = new City({
  name: "Shirawakago",
  country: Japan,
  coordinates: [137.4167, 36.25],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 19),
      eDate: new Date(2024, 7, 19),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Shirawakago.jpg",
  ],
});
