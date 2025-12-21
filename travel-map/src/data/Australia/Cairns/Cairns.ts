import { City, Travel } from "../../../core";
import { Australia } from "../Australia";
import { tr_201125_231125_images } from "./photos/tr_201125_231125";

export const Cairns = new City({
  name: "Cairns",
  country: Australia,
  coordinates: [145.775, -16.9186],
  travels: [
    new Travel({
      sDate: new Date(2025, 10, 20),
      eDate: new Date(2025, 10, 23),
      photos: tr_201125_231125_images,
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Australia/Cairns/Cairns.webp",
  ],
  population: 166304,
  timezoneGMT: 10,
});
