import { City, Travel } from "../../../core";
import { Bulgaria } from "../Bulgaria";
import { tr_190825_190825_images } from "./photos/tr_190825_190825";

export const Rila = new City({
  name: "Rila",
  country: Bulgaria,
  coordinates: [23.1120228, 42.1252326],
  travels: [
    new Travel({
      sDate: new Date(2025, 7, 19),
      eDate: new Date(2025, 7, 19),
      photos: tr_190825_190825_images,
    }),
  ],
  backgroundImgSources: ["/Bulgaria/Rila/Rila.jpg"],
  population: 3560,
  timeZone: "Europe/Sofia",
});
