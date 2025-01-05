import { City, Travel } from "../../../core";
import { Malta } from "../Malta";

export const Rabat = new City({
  name: "Rabat",
  country: Malta,
  coordinates: [14.4039, 35.8822],
  travels: [
    new Travel({
      sDate: new Date(2025, 0, 2),
      eDate: new Date(2025, 0, 2),
    }),
  ],
  backgroundImgsSrc: [
    "https://pivi-travel-map.b-cdn.net/TravelMap/Travels/Malta/Rabat/Rabat.jpg",
  ],
});
