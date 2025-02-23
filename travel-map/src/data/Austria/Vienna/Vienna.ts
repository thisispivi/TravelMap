import { City, Travel } from "../../../core";
import { Austria } from "../Austria";

export const Vienna = new City({
  name: "Vienna",
  country: Austria,
  coordinates: [16.373819, 48.208174],
  travels: [
    new Travel({
      sDate: new Date(2025, 4, 17),
      eDate: new Date(2025, 4, 20),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Austria/Vienna/Vienna.jpg",
  ],
  population: 2015000,
});
