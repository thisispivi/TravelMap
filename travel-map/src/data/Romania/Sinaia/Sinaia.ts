import { City, Travel } from "../../../core";
import { Romania } from "../Romania";
import { tr_270326_270326_images } from "./photos/tr_270326_270326";

export const Sinaia = new City({
  name: "Sinaia",
  country: Romania,
  coordinates: [25.5567, 45.3509],
  travels: [
    new Travel({
      sDate: new Date(2026, 2, 27),
      eDate: new Date(2026, 2, 27),
      photos: tr_270326_270326_images,
    }),
  ],
  backgroundImgSources: ["/Romania/Sinaia/Sinaia.jpg"],
  population: 11000,
  timeZone: "Europe/Bucharest",
});
