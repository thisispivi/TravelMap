import { City, Travel } from "../../../core";
import { Japan } from "../Japan";
import { tr_190824_210824_images } from "./photos/tr_190824_210824";

export const Kanazawa = new City({
  name: "Kanazawa",
  country: Japan,
  coordinates: [136.65, 36.5667],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 19),
      eDate: new Date(2024, 7, 21),
      isFuture: false,
      photos: tr_190824_210824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Japan/Kanazawa/Kanazawa.jpg",
  ],
  population: 461000,
  timezoneGMT: 9,
});
