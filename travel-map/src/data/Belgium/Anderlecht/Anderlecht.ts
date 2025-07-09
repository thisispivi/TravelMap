import { City, Travel } from "../../../core";
import { Belgium } from "../Belgium";
import { tr_060823_060823_images } from "./photos/tr_060823_060823";

export const Anderlecht = new City({
  name: "Anderlecht",
  country: Belgium,
  coordinates: [4.1299, 50.8383],
  travels: [
    new Travel({
      sDate: new Date(2023, 7, 6),
      eDate: new Date(2023, 7, 6),
      photos: tr_060823_060823_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Belgium/Anderlecht/Anderlecht.jpg",
  ],
  population: 124659,
  timezoneGMT: 2,
});
