import { City, Travel } from "../../../core";
import { Japan } from "../Japan";
import { tr_180824_180824_images } from "./photos/tr_180824_180824";

export const Matsumoto = new City({
  name: "Matsumoto",
  country: Japan,
  coordinates: [137.9721, 36.2381],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 18),
      eDate: new Date(2024, 7, 18),
      isFuture: false,
      photos: tr_180824_180824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Matsumoto.jpg",
  ],
  mapCoordinates: [134.5, 36.5],
});
