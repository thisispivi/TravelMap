import { City, Travel } from "../../../core";
import { Malta } from "../Malta";

export const Cospicua = new City({
  name: "Cospicua",
  country: Malta,
  coordinates: [14.5156651, 35.8827261],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 3),
      eDate: new Date(2025, 0, 3),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Cospicua.jpg",
  ],
});
