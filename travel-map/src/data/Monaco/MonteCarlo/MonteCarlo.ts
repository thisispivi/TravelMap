import { City, Travel } from "../../../core";
import { Monaco } from "../Monaco";

export const MonteCarlo = new City({
  name: "MonteCarlo",
  country: Monaco,
  coordinates: [7.424615, 43.738417],
  population: 39000,
  timezoneGMT: 1,
  travels: [
    new Travel({
      sDate: new Date(2025, 11, 30),
      eDate: new Date(2025, 11, 30),
      isFuture: false,
    }),
  ],
  backgroundImgSources: ["/Monaco/MonteCarlo/MonteCarlo.jpg"],
});
