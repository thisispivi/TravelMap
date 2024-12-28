import { City, Travel } from "../../../core";
import { Malta } from "../Malta";

export const Dingli = new City({
  name: "Dingli",
  country: Malta,
  coordinates: [14.3825, 35.8575],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 1),
      eDate: new Date(2025, 0, 1),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Dingli.jpg",
  ],
});
