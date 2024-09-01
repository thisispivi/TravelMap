import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";

export const Oshino = new City({
  name: "Oshino",
  country: Japan,
  coordinates: [138.933333, 35.316667],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 15),
      eDate: new Date(2024, 7, 15),
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Oshino.jpg",
  ],
  mapCoordinates: [135.5, 35.5],
});
