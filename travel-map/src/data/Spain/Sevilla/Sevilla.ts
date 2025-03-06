import { City, Travel } from "../../../core";
import { Spain } from "../Spain";

export const Sevilla = new City({
  name: "Sevilla",
  country: Spain,
  coordinates: [37.3886305, -5.9828988],
  travels: [
    new Travel({
      sDate: new Date(2025, 3, 4),
      eDate: new Date(2025, 3, 8),
      isFuture: true,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Spain/Sevilla/Sevilla.jpg",
  ],
  population: 684025,
});
