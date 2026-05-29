import { City } from "../../../core";
import { Australia } from "../Australia";

export const Sydney = new City({
  name: "Sydney",
  country: Australia,
  coordinates: [151.2093, -33.8688],
  timeZone: "Australia/Sydney",
  backgroundImgSources: ["/Australia/Sydney/Sydney.webp"],
  population: 5557233,
});
