import { City, Travel } from "../../../core";
import { Spain } from "../Spain";

export const Sevilla = new City({
  name: "Sevilla",
  country: Spain,
  coordinates: [-5.9828988, 37.3886305],
  travels: [
    new Travel({
      sDate: new Date(2025, 3, 4),
      eDate: new Date(2025, 3, 8),
      isFuture: false,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Spain/Sevilla/Sevilla.jpg",
  ],
  population: 684025,
});
