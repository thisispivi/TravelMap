import { City, Travel } from "../../../core";
import { Italy } from "../Italy";
import { tr_141123_141123_images } from "./photos/tr_141123_141123";

export const Genoa = new City({
  name: "Genoa",
  country: Italy,
  coordinates: [8.946256, 44.4056499],
  travels: [
    new Travel({
      sDate: new Date(2023, 10, 14),
      eDate: new Date(2023, 10, 14),
      photos: tr_141123_141123_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Italy/Genoa/Genoa.jpg",
  ],
  population: 674000,
  timezoneGMT: 1,
});
