import { City, Travel } from "../../../core";
import { Sweden } from "../Sweden";
import { tr_050626_080626_images } from "./photos/tr_050626_080626";

export const Stockholm = new City({
  name: "Stockholm",
  country: Sweden,
  coordinates: [18.0686, 59.3293],
  population: 975551,
  timeZone: "Europe/Stockholm",
  travels: [
    new Travel({
      sDate: new Date(2026, 5, 5),
      eDate: new Date(2026, 5, 8),
      isFuture: true,
      photos: tr_050626_080626_images,
    }),
  ],
  backgroundImgSources: ["/Sweden/Stockholm/Stockholm.jpg"],
});
