import { City, Travel } from "../../../core";
import { Malta } from "../Malta";

export const Valletta = new City({
  name: "Valletta",
  country: Malta,
  coordinates: [14.5147, 35.8989],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 1),
      eDate: new Date(2025, 0, 1),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Valletta.jpg",
  ],
});
