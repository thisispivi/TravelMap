import { City, Travel } from "../../../core";
import { Portugal } from "../../countries/countries";

export const Braga = new City({
  name: "Braga",
  country: Portugal,
  coordinates: [-8.4167, 41.5333],
  travels: [
    new Travel({
      sDate: new Date(2024, 3, 20),
      eDate: new Date(2024, 3, 20),
      isFuture: false,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Braga.jpg",
  ],
});
