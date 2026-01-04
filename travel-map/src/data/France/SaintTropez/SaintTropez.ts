import { City, Travel } from "../../../core";
import { France } from "../France";

export const SaintTropez = new City({
  name: "SaintTropez",
  country: France,
  coordinates: [6.6407, 43.2729],
  population: 4300,
  timeZone: "Europe/Paris",
  travels: [
    new Travel({
      sDate: new Date(2025, 11, 28),
      eDate: new Date(2025, 11, 28),
      isFuture: false,
    }),
  ],
  backgroundImgSources: ["/France/SaintTropez/SaintTropez.jpg"],
});
