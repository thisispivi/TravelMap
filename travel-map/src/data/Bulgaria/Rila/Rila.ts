import { City, Travel } from "../../../core";
import { Bulgaria } from "../Bulgaria";

export const Rila = new City({
  name: "Rila",
  country: Bulgaria,
  coordinates: [23.1120228, 42.1252326],
  travels: [
    new Travel({
      sDate: new Date(2025, 7, 19),
      eDate: new Date(2025, 7, 19),
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Bulgaria/Rila/Rila.jpg",
  ],
  population: 3560,
  timezoneGMT: 3,
});
