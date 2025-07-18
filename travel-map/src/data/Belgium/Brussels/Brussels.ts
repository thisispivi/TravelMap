import { City, Travel } from "../../../core";
import { Belgium } from "../Belgium";
import { tr_050823_100823_images } from "./photos/tr_050823_100823";

export const Brussels = new City({
  name: "Brussels",
  country: Belgium,
  coordinates: [4.34878, 50.85045],
  travels: [
    new Travel({
      sDate: new Date(2023, 7, 5),
      eDate: new Date(2023, 7, 10),
      photos: tr_050823_100823_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Belgium/Brussels/Brussels.jpg",
  ],
  population: 196828,
  timezoneGMT: 2,
});
