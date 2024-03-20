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
});
