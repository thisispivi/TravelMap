import { City, Travel } from "../../../core";
import { Belgium } from "../../countries/countries";
import { tr_050823_100823_images } from "./photos/tr_050823_100823";

export const Brussels = new City({
  name: "Brussels",
  country: Belgium,
  coordinates: [7.6868565, 45.070312],
  travels: [
    new Travel(
      new Date(2023, 7, 5),
      new Date(2023, 7, 10),
      tr_050823_100823_images
    ),
  ],
});
