import { City, Travel } from "../../../core";
import { Japan } from "../Japan";
import { tr_150824_150824_images } from "./photos/tr_150824_150824";

export const Oshino = new City({
  name: "Oshino",
  country: Japan,
  coordinates: [138.933333, 35.316667],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 15, 12, 0, 0),
      eDate: new Date(2024, 7, 15, 12, 0, 0),
      photos: tr_150824_150824_images,
    }),
  ],
  backgroundImgSources: ["/Japan/Oshino/Oshino.jpg"],
  population: 9817,
  timeZone: "Asia/Tokyo",
});
