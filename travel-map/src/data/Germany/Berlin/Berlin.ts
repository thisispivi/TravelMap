import { City, Travel } from "../../../core";
import { Germany } from "../Germany";
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
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Germany/Berlin/Berlin.jpg",
  ],
  population: 3576870,
});
