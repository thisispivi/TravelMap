import { City, Travel } from "../../../core";
import { Japan } from "../Japan";
import { tr_210824_270824_images } from "./photos/tr_210824_270824";

export const Kyoto = new City({
  name: "Kyoto",
  country: Japan,
  coordinates: [135.7681, 35.0116],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 21),
      eDate: new Date(2024, 7, 27),
      isFuture: false,
      photos: tr_210824_270824_images,
    }),
  ],
  backgroundImgSources: ["/Japan/Kyoto/Kyoto.jpg"],
  population: 1459640,
  timezoneGMT: 9,
});
