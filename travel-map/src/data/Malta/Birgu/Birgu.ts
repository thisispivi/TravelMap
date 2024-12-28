import { City, Travel } from "../../../core";
import { Malta } from "../Malta";

export const Birgu = new City({
  name: "Birgu",
  country: Malta,
  coordinates: [14.5185898, 35.886755],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 3),
      eDate: new Date(2025, 0, 3),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Birgu.jpg",
  ],
});
