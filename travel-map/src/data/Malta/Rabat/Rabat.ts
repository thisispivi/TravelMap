import { City, Travel } from "../../../core";
import { Malta } from "../Malta";

export const Rabat = new City({
  name: "Rabat",
  country: Malta,
  coordinates: [14.4039, 35.8822],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 1),
      eDate: new Date(2025, 0, 1),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Rabat.jpg",
  ],
});
