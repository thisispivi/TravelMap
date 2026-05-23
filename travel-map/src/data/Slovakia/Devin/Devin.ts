import { City, Travel } from "../../../core";
import { Slovakia } from "../Slovakia";
import { tr_030526_030526_images } from "./photos/tr_030526_030526";

export const Devin = new City({
  name: "Devin",
  country: Slovakia,
  coordinates: [16.9783, 48.1744],
  travels: [
    new Travel({
      sDate: new Date(2026, 4, 3),
      eDate: new Date(2026, 4, 3),
      photos: tr_030526_030526_images,
    }),
  ],
  backgroundImgSources: ["/Slovakia/Devin/Devin.jpg"],
  population: 1700,
  timeZone: "Europe/Bratislava",
});
