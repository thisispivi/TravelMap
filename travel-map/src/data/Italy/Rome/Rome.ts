import { City, Travel } from "../../../core";
import { Italy } from "../Italy";
import { tr_100824_120824_images } from "./photos/tr_100824_120824";
import { tr_270721_030821_images } from "./photos/tr_270721_030821";

export const Rome = new City({
  name: "Rome",
  country: Italy,
  coordinates: [12.4963655, 41.9027835],
  travels: [
    new Travel({
      sDate: new Date(2021, 6, 27),
      eDate: new Date(2021, 7, 3),
      photos: tr_270721_030821_images,
    }),
    new Travel({
      sDate: new Date(2024, 7, 10),
      eDate: new Date(2024, 7, 12),
      photos: tr_100824_120824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Rome.jpg",
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Rome-1.jpg",
  ],
  mapCoordinates: [9.3, 42],
});
