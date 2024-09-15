import { City, Travel } from "../../../core";
import { Italy } from "../../countries/countries";
import { tr_161117_191117_images } from "./photos/tr_161117_191117";

export const Bologna = new City({
  name: "Bologna",
  country: Italy,
  coordinates: [11.3, 44.5],
  travels: [
    new Travel({
      sDate: new Date(2017, 10, 16),
      eDate: new Date(2017, 10, 19),
      photos: tr_161117_191117_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/Bologna.jpg",
  ],
  mapCoordinates: [8, 44.5],
});