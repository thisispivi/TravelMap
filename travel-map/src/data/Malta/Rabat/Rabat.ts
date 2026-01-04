import { City, Travel } from "../../../core";
import { Malta } from "../Malta";
import { tr_020125_020125_images } from "./photos/tr_020125_020125";

export const Rabat = new City({
  name: "Rabat",
  country: Malta,
  coordinates: [14.4039, 35.8822],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 2, 1),
      eDate: new Date(2025, 0, 2, 1),
      photos: tr_020125_020125_images,
    }),
  ],
  backgroundImgSources: ["/Malta/Rabat/Rabat.jpg"],
  population: 12284,
  timeZone: "Europe/Malta",
});
