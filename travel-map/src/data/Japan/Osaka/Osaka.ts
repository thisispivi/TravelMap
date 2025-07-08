import { City, Travel } from "../../../core";
import { Japan } from "../Japan";
import { tr_250824_250824_images } from "./photos/tr_250824_250824";

export const Osaka = new City({
  name: "Osaka",
  country: Japan,
  coordinates: [135.5023, 34.6937],
  travels: [
    new Travel({
      sDate: new Date(2024, 7, 25),
      eDate: new Date(2024, 7, 25),
      isFuture: false,
      photos: tr_250824_250824_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Japan/Osaka/Osaka.jpg",
  ],
  population: 18967000,
  timezoneGMT: 9,
});
