import { City, Travel } from "../../../core";
import { France } from "../France";

export const Nice = new City({
  name: "Nice",
  country: France,
  coordinates: [7.261953, 43.710173],
  population: 342295,
  timeZone: "Europe/Paris",
  travels: [
    new Travel({
      sDate: new Date(2025, 11, 28),
      eDate: new Date(2025, 11, 31),
      isFuture: false,
    }),
  ],
  backgroundImgSources: ["/France/Nice/Nice.jpg"],
});
