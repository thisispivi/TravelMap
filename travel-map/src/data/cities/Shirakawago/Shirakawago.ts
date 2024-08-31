import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";
import { tr_190824_190824_images } from "./photos/tr_190824_190824";

export const Shirakawago = new City({
  name: "Shirakawago",
  country: Japan,
  coordinates: [137.4167, 36.25],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 19),
      eDate: new Date(2024, 7, 19),
      isFuture: false,
      photos: tr_190824_190824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/Backgrounds/Cities/Shirawaka-go.jpg",
  ],
  mapCoordinates: [134, 36.5],
});
