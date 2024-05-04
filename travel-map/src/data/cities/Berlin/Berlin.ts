import { City, Travel } from "../../../core";
import { Germany } from "../../countries/countries";
import { tr_150415_190415_images } from "./photos/tr_150415_190415";

export const Berlin = new City({
  name: "Berlin",
  country: Germany,
  coordinates: [13.404954, 52.520008],
  travels: [
    new Travel({
      sDate: new Date(2015, 3, 15),
      eDate: new Date(2015, 3, 19),
      photos: tr_150415_190415_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://cdn.statically.io/gh/iampivi/PhotoLake1/c3c78a72d14e8092556836839ec1dcf0dcdd4098/Backgrounds/Cities/Berlin.jpg",
  ],
});
