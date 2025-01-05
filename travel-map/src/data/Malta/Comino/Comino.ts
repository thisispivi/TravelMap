import { City, Travel } from "../../../core";
import { Malta } from "../Malta";
import { tr_040125_040125_images } from "./photos/tr_040125_040125";

export const Comino = new City({
  name: "Comino",
  country: Malta,
  coordinates: [14.3569, 36.0131],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 4, 11),
      eDate: new Date(2025, 0, 4, 11),
      photos: tr_040125_040125_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Malta/Comino/Comino.jpg",
  ],
});
