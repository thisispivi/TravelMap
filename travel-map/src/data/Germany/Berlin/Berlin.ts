import { City } from "../../../core";
import { Germany } from "../Germany";

export const Berlin = new City({
  name: "Berlin",
  country: Germany,
  coordinates: [13.404954, 52.520008],
  backgroundImgSources: ["/Germany/Berlin/Berlin.jpg"],
  population: 3576870,
  timeZone: "Europe/Berlin",
});
