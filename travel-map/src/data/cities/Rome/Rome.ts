import { City, Travel } from "../../../core";
import { Italy } from "../../countries/countries";
import { tr_270721_030821_images } from "./photos/tr_270721_030821";

export const Rome = new City({
  name: "Rome",
  country: Italy,
  coordinates: [12.4963655, 41.9027835],
  travels: [
    new Travel({
      sDate: new Date(2021, 6, 27),
      eDate: new Date(2021, 7, 3),
      photos: tr_270721_030821_images,
    }),
    new Travel({
      sDate: new Date(2024, 7, 10),
      eDate: new Date(2024, 7, 12),
      isFuture: true,
    }),
  ],
});
