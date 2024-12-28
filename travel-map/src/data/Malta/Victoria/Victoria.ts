import { City, Travel } from "../../../core";
import { Malta } from "../Malta";

export const Victoria = new City({
  name: "Victoria",
  country: Malta,
  coordinates: [14.2291969, 36.0432112],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 2),
      eDate: new Date(2025, 0, 2),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Victoria.jpg",
  ],
});
