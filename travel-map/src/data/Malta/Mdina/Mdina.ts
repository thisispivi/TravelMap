import { City, Travel } from "../../../core";
import { Malta } from "../Malta";
import { tr_020125_020125_images } from "./photos/tr_020125_020125";

export const Mdina = new City({
  name: "Mdina",
  country: Malta,
  coordinates: [14.4065, 35.8869],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 2),
      eDate: new Date(2025, 0, 2),
      photos: tr_020125_020125_images,
    }),
  ],
  backgroundImgSources: ["/Malta/Mdina/Mdina.jpg"],
  population: 278,
  timeZone: "Europe/Malta",
});
