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
});
