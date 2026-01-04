import { City, Travel } from "../../../core";
import { Japan } from "../Japan";
import { tr_150824_150824_images } from "./photos/tr_150824_150824";

export const Fujikawaguchiko = new City({
  name: "Fujikawaguchiko",
  country: Japan,
  coordinates: [138.766667, 35.483333],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 15, 13, 0, 0),
      eDate: new Date(2024, 7, 15, 13, 0, 0),
      photos: tr_150824_150824_images,
    }),
  ],
  backgroundImgSources: ["/Japan/Fujikawaguchiko/Fujikawaguchiko.jpg"],
  population: 26542,
  timeZone: "Asia/Tokyo",
});
