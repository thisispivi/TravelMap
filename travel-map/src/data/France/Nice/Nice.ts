import { City, Travel } from "../../../core";
import { France } from "../France";

export const Nice = new City({
  name: "Nice",
  country: France,
  coordinates: [7.261953, 43.710173],
  population: 342295,
  timezoneGMT: 1,
  travels: [
    new Travel({
      sDate: new Date(2025, 11, 28),
      eDate: new Date(2025, 11, 31),
      isFuture: false,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/France/Nice/Nice.jpg",
  ],
});
