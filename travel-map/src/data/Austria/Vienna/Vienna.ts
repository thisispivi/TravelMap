import { City, Travel } from "../../../core";
import { Austria } from "../Austria";
import { tr_170525_200525_images } from "./photos/tr_170525_200525";

export const Vienna = new City({
  name: "Vienna",
  country: Austria,
  coordinates: [16.373819, 48.208174],
  travels: [
    new Travel({
      sDate: new Date(2025, 4, 17),
      eDate: new Date(2025, 4, 20),
      photos: tr_170525_200525_images,
    }),
  ],
  backgroundImgSources: ["/Austria/Vienna/Vienna.jpg"],
  population: 2015000,
  timezoneGMT: 2,
});
