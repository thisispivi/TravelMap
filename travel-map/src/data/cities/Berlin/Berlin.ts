import { City, Travel } from "../../../core";
import { Germany } from "../../countries/countries";
import { tr_190415_220415_images } from "./photos/tr_190415_220415";

export const Berlin = new City({
  name: "Berlin",
  country: Germany,
  coordinates: [13.404954, 52.520008],
  travels: [
    new Travel({
      sDate: new Date(2015, 3, 19),
      eDate: new Date(2015, 3, 22),
      photos: tr_190415_220415_images,
    }),
  ],
});
