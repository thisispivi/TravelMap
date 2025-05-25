import { City, Travel } from "../../../core";
import { Italy } from "../Italy";
import { tr_230921_260921_images } from "./photos/tr_230921_260921";

export const Cefalù = new City({
  name: "Cefalù",
  country: Italy,
  coordinates: [13.988, 38.0342],
  travels: [
    new Travel({
      sDate: new Date(2021, 8, 23),
      eDate: new Date(2021, 8, 26),
      photos: tr_230921_260921_images,
    }),
    new Travel({
      sDate: new Date(2025, 5, 14),
      eDate: new Date(2025, 5, 17),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Italy/Cefal%C3%B9/Cefal%C3%B9.jpg",
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Italy/Cefal%C3%B91/Cefal%C3%B91.jpg",
  ],
  population: 14407,
});
