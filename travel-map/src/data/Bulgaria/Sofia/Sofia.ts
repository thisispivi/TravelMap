import { City, Travel } from "../../../core";
import { Bulgaria } from "../Bulgaria";
import { tr_170825_210825_images } from "./photos/tr_170825_210825";

export const Sofia = new City({
  name: "Sofia",
  country: Bulgaria,
  coordinates: [23.3219, 42.6977],
  travels: [
    new Travel({
      sDate: new Date(2025, 7, 17),
      eDate: new Date(2025, 7, 21),
      photos: tr_170825_210825_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Bulgaria/Sofia/Sofia.jpg",
  ],
  population: 1241675,
  timezoneGMT: 3,
});
