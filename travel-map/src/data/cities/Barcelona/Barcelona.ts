import { City, Travel } from "../../../core";
import { Spain } from "../../countries/countries";
import { tr_110416_150416_images } from "./photos/tr_110416_150416";

export const Barcelona = new City({
  name: "Barcelona",
  country: Spain,
  coordinates: [2.1734035, 41.3850639],
  travels: [
    new Travel({
      sDate: new Date(2016, 3, 11),
      eDate: new Date(2016, 3, 15),
      photos: tr_110416_150416_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Barcelona.jpg",
  ],
});
