import { City, Travel } from "../../../core";
import { Italy } from "../Italy";
import { tr_220422_250422_images } from "./photos/tr_220422_250422";

export const Imola = new City({
  name: "Imola",
  country: Italy,
  coordinates: [11.716667, 44.35],
  travels: [
    new Travel({
      sDate: new Date(2022, 3, 22),
      eDate: new Date(2022, 3, 25),
      photos: tr_220422_250422_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Italy/Imola/Imola.jpg",
  ],
  population: 70453,
  timezoneGMT: 2,
});
