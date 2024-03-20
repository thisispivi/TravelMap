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
      isFuture: true,
    }),
  ],
});
