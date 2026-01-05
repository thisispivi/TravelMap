import { City, Travel } from "../../../core";
import { France } from "../France";
import { tr_281225_020126_images } from "./photos/tr_281225_020126";

export const Toulon = new City({
  name: "Toulon",
  country: France,
  coordinates: [5.928, 43.124228],
  population: 167000,
  timeZone: "Europe/Paris",
  travels: [
    new Travel({
      sDate: new Date(2025, 11, 28),
      eDate: new Date(2026, 0, 2),
      photos: tr_281225_020126_images,
    }),
  ],
  backgroundImgSources: ["/France/Toulon/Toulon.jpg"],
});
