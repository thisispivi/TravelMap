import { City, Travel } from "../../../core";
import { Japan } from "../Japan";
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
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Japan/Shirakawa-go/Shirakawa-go.jpg",
  ],
  population: 65665,
  timezoneGMT: 9,
});
