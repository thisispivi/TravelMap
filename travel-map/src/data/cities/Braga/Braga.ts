import { City, Travel } from "../../../core";
import { Portugal } from "../../countries/countries";

export const Braga = new City({
  name: "Braga",
  country: Portugal,
  coordinates: [-8.4167, 41.5333],
  travels: [
    new Travel({
      sDate: new Date(2024, 3, 21),
      eDate: new Date(2024, 3, 21),
      isFuture: false,
    }),
  ],
});
