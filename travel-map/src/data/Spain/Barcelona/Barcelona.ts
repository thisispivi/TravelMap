import { City, Travel } from "../../../core";
import { Spain } from "../Spain";
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
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Spain/Barcelona/Barcelona.jpg",
  ],
  population: 5712000,
});
