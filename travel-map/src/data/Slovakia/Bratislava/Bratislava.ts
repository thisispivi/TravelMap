import { City, Travel } from "../../../core";
import { Slovakia } from "../Slovakia";
import { tr_010526_040526_images } from "./photos/tr_010526_040526";

export const Bratislava = new City({
  name: "Bratislava",
  country: Slovakia,
  coordinates: [17.107508, 48.148598],
  travels: [
    new Travel({
      sDate: new Date(2026, 4, 1),
      eDate: new Date(2026, 4, 4),
      photos: tr_010526_040526_images,
    }),
  ],
  backgroundImgSources: ["/Slovakia/Bratislava/Bratislava.jpg"],
  population: 440000,
  timeZone: "Europe/Bratislava",
});
