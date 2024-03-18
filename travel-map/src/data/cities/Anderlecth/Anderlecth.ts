import { City, Travel } from "../../../core";
import { Belgium } from "../../countries/countries";
import { tr_060823_060823_images } from "./photos/tr_060823_060823";

export const Anderlecth = new City({
  name: "Anderlecht",
  country: Belgium,
  coordinates: [4.1360105, 50.8127957],
  travels: [
    new Travel(
      new Date(2023, 7, 6),
      new Date(2023, 7, 6),
      tr_060823_060823_images,
    ),
  ],
});
