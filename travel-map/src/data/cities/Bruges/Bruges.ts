import { City, Travel } from "../../../core";
import { Belgium } from "../../countries/countries";
import { tr_090823_090823_images } from "./photos/tr_090823_090823";

export const Bruges = new City({
  name: "Bruges",
  country: Belgium,
  coordinates: [7.6868565, 45.070312],
  travels: [
    new Travel(
      new Date(2023, 7, 9),
      new Date(2023, 7, 9),
      tr_090823_090823_images
    ),
  ],
});
