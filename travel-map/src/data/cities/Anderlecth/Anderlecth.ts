import { City, Travel } from "../../../core";
import { Belgium } from "../../countries/countries";
import { tr_060823_060823_images } from "./photos/tr_060823_060823";

export const Anderlecth = new City({
  name: "Anderlecht",
  country: Belgium,
  coordinates: [4.3299, 50.8383],
  travels: [
    new Travel({
      sDate: new Date(2023, 7, 6),
      eDate: new Date(2023, 7, 6),
      photos: tr_060823_060823_images,
    }),
  ],
});
