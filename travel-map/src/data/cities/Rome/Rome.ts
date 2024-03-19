import { City, Travel } from "../../../core";
import { Italy } from "../../countries/countries";
import { tr_270721_030821_images } from "./photos/tr_270721_030821";

export const Rome = new City({
  name: "Rome",
  country: Italy,
  coordinates: [12.4963655, 41.9027835],
  travels: [
    new Travel(
      new Date(2021, 6, 27),
      new Date(2021, 7, 3),
      tr_270721_030821_images
    ),
  ],
});
