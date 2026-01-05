import { City, Travel } from "../../../core";
import { France } from "../France";
import { tr_311225_311225_images } from "./photos/tr_311225_311225";

export const Cannes = new City({
  name: "Cannes",
  country: France,
  coordinates: [7.0174, 43.5528],
  population: 74000,
  timeZone: "Europe/Paris",
  travels: [
    new Travel({
      sDate: new Date(2025, 11, 31),
      eDate: new Date(2025, 11, 31),
      photos: tr_311225_311225_images,
    }),
  ],
  backgroundImgSources: ["/France/Cannes/Cannes.jpg"],
});
