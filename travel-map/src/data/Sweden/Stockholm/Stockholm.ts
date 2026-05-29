import { City } from "../../../core";
import { Sweden } from "../Sweden";

export const Stockholm = new City({
  name: "Stockholm",
  country: Sweden,
  coordinates: [18.0686, 59.3293],
  population: 975551,
  timeZone: "Europe/Stockholm",
  backgroundImgSources: ["/Sweden/Stockholm/Stockholm.jpg"],
});
