import { City } from "../../../core/classes/City";
import { Travel } from "../../../core/classes/Travel";
import { Belgium } from "../../countries/countries";
import { tr6_6_8_23_images } from "./photos/6_6_8_23";

export const Anderlecth = new City({
  name: "Anderlecht",
  country: Belgium,
  coordinates: [4.1360105, 50.8127957],
  travels: [
    new Travel(new Date(2023, 7, 6), new Date(2023, 7, 6), tr6_6_8_23_images),
  ],
});
