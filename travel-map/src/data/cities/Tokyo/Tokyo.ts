import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";

export const Tokyo = new City({
  name: "Tokyo",
  country: Japan,
  coordinates: [139.6917, 35.6895],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 13),
      eDate: new Date(2024, 7, 18),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Tokyo.jpg",
  ],
});
