import { City, Travel } from "../../../core";
import { Malta } from "../Malta";
import { tr_040125_040125_images } from "./photos/tr_040125_040125";

export const Victoria = new City({
  name: "Victoria",
  country: Malta,
  coordinates: [14.2291969, 36.0432112],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 4, 15),
      eDate: new Date(2025, 0, 4, 15),
      photos: tr_040125_040125_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Malta/Victoria/Victoria.jpg",
  ],
  population: 5921,
  timezoneGMT: 2,
});
