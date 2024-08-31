import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";
import { tr_240824_240824_images } from "./photos/tr_240824_240824";

export const Nara = new City({
  name: "Nara",
  country: Japan,
  coordinates: [135.8048, 34.6851],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 24),
      eDate: new Date(2024, 7, 24),
      isFuture: false,
      photos: tr_240824_240824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/Backgrounds/Cities/Nara.jpg",
  ],
  mapCoordinates: [132.6, 35],
});
