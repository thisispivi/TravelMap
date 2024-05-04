import { City, Travel } from "../../../core";
import { Belgium } from "../../countries/countries";
import { tr_090823_090823_images } from "./photos/tr_090823_090823";

export const Bruges = new City({
  name: "Bruges",
  country: Belgium,
  coordinates: [3.2247, 51.2093],
  travels: [
    new Travel({
      sDate: new Date(2023, 7, 9),
      eDate: new Date(2023, 7, 9),
      photos: tr_090823_090823_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Bruges.jpg",
  ],
});
