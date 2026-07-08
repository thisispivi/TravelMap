import { City } from "../../../core";
import { Germany } from "../Germany";

export const Beilstein = new City({
  name: "Beilstein",
  country: Germany,
  coordinates: [7.241076, 50.1092636],
  minMarkerScale: 0.01,
  timeZone: "Europe/Berlin",
  backgroundImgSources: ["/Germany/Beilstein/Beilstein.jpg"],
});
