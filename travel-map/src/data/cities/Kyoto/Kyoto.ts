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
      isFuture: true,
    }),
  ],
});
