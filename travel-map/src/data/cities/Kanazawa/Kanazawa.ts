import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";

export const Kanazawa = new City({
  name: "Kanazawa",
  country: Japan,
  coordinates: [136.65, 36.5667],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 19),
      eDate: new Date(2024, 7, 21),
      isFuture: false,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Kanazawa.jpg",
  ],
});
