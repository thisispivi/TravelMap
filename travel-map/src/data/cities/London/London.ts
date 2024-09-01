import { City, Travel } from "../../../core";
import { UnitedKingdom } from "../../countries/countries";
import { tr_090511_120511_images } from "./photos/tr_090511_120511";

// TODO : Set right dates
export const London = new City({
  name: "London",
  country: UnitedKingdom,
  coordinates: [-0.1276474, 51.5073219],
  travels: [
    new Travel({
      sDate: new Date(2011, 4, 9),
      eDate: new Date(2011, 4, 12),
      photos: tr_090511_120511_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Backgrounds/Cities/London.jpg",
  ],
  mapCoordinates: [-3.5, 51.5],
});
