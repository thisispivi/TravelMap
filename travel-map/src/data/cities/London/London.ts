import { City, Travel } from "../../../core";
import { UnitedKingdom } from "../../countries/countries";
import { tr_110416_150416_images } from "./photos/tr_110416_150416";

// TODO : Set right dates
export const London = new City({
  name: "London",
  country: UnitedKingdom,
  coordinates: [-0.1276474, 51.5073219],
  travels: [
    new Travel({
      sDate: new Date(2016, 3, 11),
      eDate: new Date(2016, 3, 15),
      photos: tr_110416_150416_images,
    }),
  ],
});
