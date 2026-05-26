import { City } from "../../../core";
import { Vatican } from "../Vatican";

export const VaticanCity = new City({
  name: "VaticanCity",
  country: Vatican,
  coordinates: [12.4334, 41.9029],
  backgroundImgSources: ["/Vatican/VaticanCity/VaticanCity.jpg"],
  population: 499,
  timeZone: "Europe/Vatican",
});
