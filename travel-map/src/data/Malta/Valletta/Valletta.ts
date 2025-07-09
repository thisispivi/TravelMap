import { City, Travel } from "../../../core";
import { Malta } from "../Malta";
import { tr_020125_020125_images } from "./photos/tr_020125_020125";
import { tr_030125_030125_images } from "./photos/tr_030125_030125";

export const Valletta = new City({
  name: "Valletta",
  country: Malta,
  coordinates: [14.5147, 35.8989],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 2, 2),
      eDate: new Date(2025, 0, 2, 2),
      photos: tr_020125_020125_images,
    }),
    new Travel({
      sDate: new Date(2025, 0, 3),
      eDate: new Date(2025, 0, 3),
      photos: tr_030125_030125_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Malta/Valletta/Valletta.jpg",
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Malta/Valletta1/Valletta1.jpg",
  ],
  population: 5876,
  timezoneGMT: 2,
});
