import { City, Travel } from "../../../core";
import { Belgium } from "../../countries/countries";
import { tr_050823_100823_images } from "./photos/tr_050823_100823";

export const Brussels = new City({
  name: "Brussels",
  country: Belgium,
  coordinates: [4.34878, 50.85045],
  travels: [
    new Travel({
      sDate: new Date(2023, 7, 5),
      eDate: new Date(2023, 7, 10),
      photos: tr_050823_100823_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Brussels.jpg",
  ],
});
