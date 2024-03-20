import { City, Travel } from "../../../core";
import { Italy } from "../../countries/countries";
import { tr_220422_240422_images } from "./photos/tr_220422_240422";

export const Imola = new City({
  name: "Imola",
  country: Italy,
  coordinates: [11.716667, 44.35],
  travels: [
    new Travel({
      sDate: new Date(2022, 3, 22),
      eDate: new Date(2022, 3, 24),
      photos: tr_220422_240422_images,
    }),
  ],
});
