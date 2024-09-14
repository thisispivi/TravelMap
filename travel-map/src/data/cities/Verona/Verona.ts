import { City, Travel } from "../../../core";
import { Italy } from "../../countries/countries";

export const Verona = new City({
  name: "Verona",
  country: Italy,
  coordinates: [10.9916, 45.4384],
  travels: [
    new Travel({
      sDate: new Date(2024, 9, 6),
      eDate: new Date(2024, 9, 4),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Verona.jpg",
  ],
  mapCoordinates: [7, 45],
});
