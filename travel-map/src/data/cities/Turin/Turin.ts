import { City, Travel } from "../../../core";
import { Italy } from "../../countries/countries";
import { tr_111123_141123_images } from "./photos/tr_111123_141123";

export const Turin = new City({
  name: "Turin",
  country: Italy,
  coordinates: [7.6868565, 45.070312],
  travels: [
    new Travel({
      sDate: new Date(2023, 10, 11),
      eDate: new Date(2023, 10, 14),
      photos: tr_111123_141123_images,
    }),
  ],
});
