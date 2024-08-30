import { City, Travel } from "../../../core";
import { Portugal } from "../../countries/countries";
import { tr_200424_200424_images } from "./photos/tr_200424_200424";

export const Braga = new City({
  name: "Braga",
  country: Portugal,
  coordinates: [-8.4167, 41.5333],
  travels: [
    new Travel({
      sDate: new Date(2024, 3, 20),
      eDate: new Date(2024, 3, 20),
      photos: tr_200424_200424_images,
      isFuture: false,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/Backgrounds/Cities/Braga.jpg",
  ],
});
