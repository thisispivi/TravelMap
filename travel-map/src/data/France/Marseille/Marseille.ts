import { City, Travel } from "../../../core";
import { France } from "../France";
import { tr_010126_010126_images } from "./photos/tr_010126_010126";

export const Marseille = new City({
  name: "Marseille",
  country: France,
  coordinates: [5.36978, 43.296482],
  population: 861635,
  timeZone: "Europe/Paris",
  travels: [
    new Travel({
      sDate: new Date(2026, 0, 1),
      eDate: new Date(2026, 0, 1),
      photos: tr_010126_010126_images,
    }),
  ],
  backgroundImgSources: ["/France/Marseille/Marseille.jpg"],
});
