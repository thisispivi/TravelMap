import { City, Travel } from "../../../core";
import { France } from "../France";
import { tr_281225_311225_images } from "./photos/tr_281225_311225";

export const Nice = new City({
  name: "Nice",
  country: France,
  coordinates: [7.261953, 43.710173],
  population: 342295,
  timeZone: "Europe/Paris",
  travels: [
    new Travel({
      sDate: new Date(2025, 11, 28, 17, 0),
      eDate: new Date(2025, 11, 31),
      photos: tr_281225_311225_images,
    }),
  ],
  backgroundImgSources: ["/France/Nice/Nice.jpg"],
});
