import { City, Travel } from "../../../core";
import { Romania } from "../Romania";
import { tr_270326_270326_images } from "./photos/tr_270326_270326";

export const Brasov = new City({
  name: "Brasov",
  country: Romania,
  coordinates: [25.596, 45.6427],
  travels: [
    new Travel({
      sDate: new Date(2026, 2, 27),
      eDate: new Date(2026, 2, 27),
      photos: tr_270326_270326_images,
    }),
  ],
  backgroundImgSources: ["/Romania/Brasov/Brasov.jpg"],
  population: 290000,
  timeZone: "Europe/Bucharest",
});
