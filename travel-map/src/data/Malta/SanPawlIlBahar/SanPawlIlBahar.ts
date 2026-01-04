import { City, Travel } from "../../../core";
import { Malta } from "../Malta";
import { tr_040125_040125_images } from "./photos/tr_040125_040125";

export const SanPawlIlBahar = new City({
  name: "SanPawlIlBahar",
  country: Malta,
  coordinates: [14.5014, 35.9122],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 4),
      eDate: new Date(2025, 0, 4),
      photos: tr_040125_040125_images,
    }),
  ],
  backgroundImgSources: ["/Malta/SanPawlIlBahar/SanPawlIlBahar.jpg"],
  population: 32042,
  timeZone: "Europe/Malta",
});
