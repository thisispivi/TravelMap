import { City, Travel } from "../../../core";
import { Belgium } from "../../countries/countries";
import { tr_090823_090823_images } from "./photos/tr_090823_090823";

export const Bruges = new City({
  name: "Bruges",
  country: Belgium,
  coordinates: [3.2247, 51.2093],
  travels: [
    new Travel({
      sDate: new Date(2023, 7, 9),
      eDate: new Date(2023, 7, 9),
      photos: tr_090823_090823_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/Backgrounds/Cities/Bruges.jpg",
  ],
  mapCoordinates: [0, 51],
});
