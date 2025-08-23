import { City, Travel } from "../../../core";
import { Malta } from "../Malta";
import { tr_020125_020125_images } from "./photos/tr_020125_020125";
import { tr_040125_040125_images } from "./photos/tr_040125_040125";

export const SanGiljan = new City({
  name: "SanGiljan",
  country: Malta,
  coordinates: [14.5147, 35.8989],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 2, 23),
      eDate: new Date(2025, 0, 2, 23),
      photos: tr_020125_020125_images,
    }),
    new Travel({
      sDate: new Date(2025, 0, 4, 23),
      eDate: new Date(2025, 0, 4, 23),
      photos: tr_040125_040125_images,
      rowConstraints: { minPhotos: 2, maxPhotos: 7 },
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Malta/SanGiljan/SanGiljan.jpg",
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Malta/SanGiljan1/SanGiljan1.jpg",
  ],
  population: 3259,
  timezoneGMT: 2,
});
