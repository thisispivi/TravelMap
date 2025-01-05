import { City, Travel } from "../../../core";
import { Japan } from "../Japan";
import { tr_230824_230824_images } from "./photos/tr_230824_230824";

export const Himeji = new City({
  name: "Himeji",
  country: Japan,
  coordinates: [134.6939, 34.8263],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 23),
      eDate: new Date(2024, 7, 23),
      isFuture: false,
      photos: tr_230824_230824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Japan/Himeji/Himeji.jpg",
  ],
});
