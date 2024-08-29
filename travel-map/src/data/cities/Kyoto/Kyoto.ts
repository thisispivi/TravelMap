import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";

export const Kyoto = new City({
  name: "Kyoto",
  country: Japan,
  coordinates: [135.7681, 35.0116],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 21),
      eDate: new Date(2024, 7, 27),
      isFuture: false,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Kyoto.jpg",
  ],
});
