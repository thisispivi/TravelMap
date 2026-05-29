import { City } from "../../../core";
import { Austria } from "../Austria";

export const Vienna = new City({
  name: "Vienna",
  country: Austria,
  coordinates: [16.373819, 48.208174],
  backgroundImgSources: ["/Austria/Vienna/Vienna.jpg"],
  population: 2015000,
  timeZone: "Europe/Vienna",
});
