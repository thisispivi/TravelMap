import { City, Travel } from "../../../core";
import { Vatican } from "../Vatican";
import { tr_300721_300721_images } from "./photos/tr_300721_300721";

export const VaticanCity = new City({
  name: "VaticanCity",
  country: Vatican,
  coordinates: [12.4334, 41.9029],
  travels: [
    new Travel({
      sDate: new Date(2021, 6, 30),
      eDate: new Date(2021, 6, 30),
      photos: tr_300721_300721_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Vatican/VaticanCity/VaticanCity.jpg",
  ],
  population: 499,
  timezoneGMT: 1,
});
