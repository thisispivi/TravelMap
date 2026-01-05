import { City, Travel } from "../../../core";
import { France } from "../France";
import { tr_281225_281225_images } from "./photos/tr_281225_281225";

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
      photos: tr_281225_281225_images,
    }),
  ],
  backgroundImgSources: ["/France/SaintTropez/SaintTropez.jpg"],
});
