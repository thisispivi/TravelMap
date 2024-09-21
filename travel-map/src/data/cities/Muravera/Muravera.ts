import { City } from "../../../core";
import { Italy } from "../../countries/countries";

export const Cagliari = new City({
  name: "Cagliari",
  country: Italy,
  coordinates: [9.1167, 39.2167],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Cagliari.jpg",
  ],
  mapCoordinates: [15.5, 47.5],
});
