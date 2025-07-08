import { City, Travel } from "../../../core";
import { Malta } from "../Malta";
import { tr_010125_050125_images } from "./photos/tr_010125_050125";

export const Sliema = new City({
  name: "Sliema",
  country: Malta,
  coordinates: [14.5014, 35.9122],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 1),
      eDate: new Date(2025, 0, 5),
      photos: tr_010125_050125_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Malta/Sliema/Sliema.jpg",
  ],
  population: 22591,
  timezoneGMT: 1,
});
