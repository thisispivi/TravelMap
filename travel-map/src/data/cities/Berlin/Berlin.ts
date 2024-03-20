import { City, Travel } from "../../../core";
import { Germany } from "../../countries/countries";
import { tr_060523_090523_images } from "./photos/tr_060523_090523";
// TODO : Set right dates
export const Berlin = new City({
  name: "Berlin",
  country: Germany,
  coordinates: [13.404954, 52.520008],
  travels: [
    new Travel({
      sDate: new Date(2023, 4, 6),
      eDate: new Date(2023, 4, 9),
      photos: tr_060523_090523_images,
    }),
  ],
});
