import { City, Travel } from "../../../core";
import { Malta } from "../Malta";

export const Senglea = new City({
  name: "Senglea",
  country: Malta,
  coordinates: [14.5069689, 35.8875564],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 3),
      eDate: new Date(2025, 0, 3),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Senglea.jpg",
  ],
});
