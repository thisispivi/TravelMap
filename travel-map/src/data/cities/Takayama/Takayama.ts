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
});
