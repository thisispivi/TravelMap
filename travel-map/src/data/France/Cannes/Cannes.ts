import { City, Travel } from "../../../core";
import { France } from "../France";

export const Cannes = new City({
  name: "Cannes",
  country: France,
  coordinates: [7.017369, 43.552847],
  population: 74000,
  timezoneGMT: 1,
  travels: [
    new Travel({
      sDate: new Date(2025, 11, 29),
      eDate: new Date(2025, 11, 29),
      isFuture: false,
    }),
  ],
  backgroundImgSources: ["/France/Cannes/Cannes.jpg"],
});
