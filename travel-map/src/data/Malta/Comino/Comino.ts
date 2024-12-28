import { City, Travel } from "../../../core";
import { Malta } from "../Malta";

export const Comino = new City({
  name: "Comino",
  country: Malta,
  coordinates: [14.3569, 36.0131],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 2),
      eDate: new Date(2025, 0, 2),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Comino.jpg",
  ],
});
