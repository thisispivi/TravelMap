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
      isFuture: true,
    }),
  ],
});
