import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";

export const Osaka = new City({
  name: "Osaka",
  country: Japan,
  coordinates: [135.5023, 34.6937],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 22),
      eDate: new Date(2024, 7, 22),
      isFuture: true,
    }),
  ],
});
