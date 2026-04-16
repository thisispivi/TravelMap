import { City, Travel } from "../../../core";
import { Romania } from "../Romania";
import { tr_260326_300326_images } from "./photos/tr_260326_300326";

export const Bucharest = new City({
  name: "Bucharest",
  country: Romania,
  coordinates: [26.1025, 44.4268],
  travels: [
    new Travel({
      sDate: new Date(2026, 2, 26),
      eDate: new Date(2026, 2, 30),
      photos: tr_260326_300326_images,
    }),
  ],
  backgroundImgSources: ["/Romania/Bucharest/Bucharest.webp"],
  population: 1883425,
  timeZone: "Europe/Bucharest",
});
