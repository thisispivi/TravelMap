import { City, Travel } from "../../../core";
import { Australia } from "../Australia";
import { tr_181125_281125_images } from "./photos/tr_181125_281125";

export const Sydney = new City({
  name: "Sydney",
  country: Australia,
  coordinates: [151.2093, -33.8688],
  travels: [
    new Travel({
      sDate: new Date(2025, 10, 18),
      eDate: new Date(2025, 10, 28),
      photos: tr_181125_281125_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Australia/Sydney/Sydney.webp",
  ],
  population: 5557233,
  timezoneGMT: 11,
});
