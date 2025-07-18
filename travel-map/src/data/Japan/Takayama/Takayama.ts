import { City, Travel } from "../../../core";
import { Japan } from "../Japan";
import { tr_180824_190824_images } from "./photos/tr_180824_190824";

export const Takayama = new City({
  name: "Takayama",
  country: Japan,
  coordinates: [137.2513, 36.1408],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 18),
      eDate: new Date(2024, 7, 19),
      isFuture: false,
      photos: tr_180824_190824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Japan/Takayama/Takayama.jpg",
  ],
  population: 94879,
  timezoneGMT: 9,
});
