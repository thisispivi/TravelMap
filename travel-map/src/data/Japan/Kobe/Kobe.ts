import { City, Travel } from "../../../core";
import { Japan } from "../Japan";
import { tr_230824_230824_images } from "./photos/tr_230824_230824";

export const Kobe = new City({
  name: "Kobe",
  country: Japan,
  coordinates: [135.1955, 34.6901],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 23),
      eDate: new Date(2024, 7, 23),
      isFuture: false,
      photos: tr_230824_230824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Japan/Kobe/Kobe.jpg",
  ],
});
