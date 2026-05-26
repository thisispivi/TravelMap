import { City } from "../../../core";
import { Italy } from "../Italy";

export const Bologna = new City({
  name: "Bologna",
  country: Italy,
  coordinates: [11.3, 44.5],
  backgroundImgSources: ["/Italy/Bologna/Bologna.jpg"],
  population: 816848,
  timeZone: "Europe/Rome",
});
