import { City, Travel } from "../../../core";
import { France } from "../France";

export const Toulon = new City({
  name: "Toulon",
  country: France,
  coordinates: [5.928, 43.124228],
  population: 167000,
  timezoneGMT: 1,
  travels: [
    new Travel({
      sDate: new Date(2025, 11, 31),
      eDate: new Date(2026, 0, 2),
      isFuture: false,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/France/Toulon/Toulon.jpg",
  ],
});
