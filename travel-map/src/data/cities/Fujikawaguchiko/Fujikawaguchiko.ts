import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";

export const Fujikawaguchiko = new City({
  name: "Fujikawaguchiko",
  country: Japan,
  coordinates: [138.766667, 35.483333],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 15, 12, 30, 0),
      eDate: new Date(2024, 7, 15, 18, 0, 0),
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Fujikawaguchiko.jpg",
  ],
  mapCoordinates: [135.5, 36],
});
