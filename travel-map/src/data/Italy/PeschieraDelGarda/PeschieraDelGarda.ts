import { City, Travel } from "../../../core";
import { Italy } from "../Italy";
import { tr_041024_061024_images } from "./photos/tr_041024_061024";

export const PeschieraDelGarda = new City({
  name: "PeschieraDelGarda",
  country: Italy,
  coordinates: [10.6984, 45.4384],
  travels: [
    new Travel({
      sDate: new Date(2024, 9, 4),
      eDate: new Date(2024, 9, 6),
      isFuture: false,
      photos: tr_041024_061024_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/PeschieraDelGarda.jpg",
  ],
});
