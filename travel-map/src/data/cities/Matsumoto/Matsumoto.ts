import { City, Travel } from "../../../core";
import { Japan } from "../../countries/countries";
import { tr_180824_180824_images } from "./photos/tr_180824_180824";

export const Matsumoto = new City({
  name: "Matsumoto",
  country: Japan,
  coordinates: [137.9721, 36.2381],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 18),
      eDate: new Date(2024, 7, 18),
      isFuture: false,
      photos: tr_180824_180824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/34b01ca98aecc070663a73d83e0720701e88b8a1/Backgrounds/Cities/Matsumoto.jpg",
  ],
});
