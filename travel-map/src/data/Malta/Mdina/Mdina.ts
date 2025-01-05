import { City, Travel } from "../../../core";
import { Malta } from "../Malta";

export const Mdina = new City({
  name: "Mdina",
  country: Malta,
  coordinates: [14.4065, 35.8869],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 2),
      eDate: new Date(2025, 0, 2),
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Malta/Mdina/Mdina.jpg",
  ],
});
