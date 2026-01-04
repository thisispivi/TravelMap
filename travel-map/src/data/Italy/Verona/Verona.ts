import { City, Travel } from "../../../core";
import { Italy } from "../Italy";
import { tr_061024_061024_images } from "./photos/tr_061024_061024";

export const Verona = new City({
  name: "Verona",
  country: Italy,
  coordinates: [10.9916, 45.4384],
  travels: [
    new Travel({
      sDate: new Date(2024, 9, 6),
      eDate: new Date(2024, 9, 6),
      isFuture: false,
      photos: tr_061024_061024_images,
    }),
  ],
  backgroundImgSources: ["/Italy/Verona/Verona.jpg"],
  population: 644000,
  timeZone: "Europe/Rome",
});
