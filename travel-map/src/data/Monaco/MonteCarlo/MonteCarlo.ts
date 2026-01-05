import { City, Travel } from "../../../core";
import { Monaco } from "../Monaco";
import { tr_291225_291225_images } from "./photos/tr_291225_291225";

export const MonteCarlo = new City({
  name: "MonteCarlo",
  country: Monaco,
  coordinates: [7.424615, 43.738417],
  population: 39000,
  travels: [
    new Travel({
      sDate: new Date(2025, 11, 29),
      eDate: new Date(2025, 11, 29),
      photos: tr_291225_291225_images,
    }),
  ],
  backgroundImgSources: ["/Monaco/MonteCarlo/MonteCarlo.jpg"],
  timeZone: "Europe/Monaco",
});
