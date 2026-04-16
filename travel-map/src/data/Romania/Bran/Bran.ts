import { City, Travel } from "../../../core";
import { Romania } from "../Romania";
import { tr_270326_270326_images } from "./photos/tr_270326_270326";

export const Bran = new City({
  name: "Bran",
  country: Romania,
  coordinates: [25.3672, 45.513],
  travels: [
    new Travel({
      sDate: new Date(2026, 2, 27),
      eDate: new Date(2026, 2, 27),
      photos: tr_270326_270326_images,
    }),
  ],
  backgroundImgSources: ["/Romania/Bran/Bran.jpg"],
  population: 6000,
  timeZone: "Europe/Bucharest",
});
