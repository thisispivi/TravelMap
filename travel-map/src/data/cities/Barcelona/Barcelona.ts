import { City, Travel } from "../../../core";
import { Spain } from "../../countries/countries";
import { tr_110416_150416_images } from "./photos/tr_110416_150416";

export const Barcelona = new City({
  name: "Barcelona",
  country: Spain,
  coordinates: [2.1734035, 41.3850639],
  travels: [
    new Travel(
      new Date(2016, 3, 11),
      new Date(2016, 3, 15),
      tr_110416_150416_images
    ),
  ],
});
