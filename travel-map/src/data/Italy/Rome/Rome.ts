import { City } from "../../../core";
import { Italy } from "../Italy";

export const Rome = new City({
  name: "Rome",
  country: Italy,
  coordinates: [12.4963655, 41.9027835],
  backgroundImgSources: ["/Italy/Rome/Rome.jpg", "/Italy/Rome1/Rome1.jpg"],
  population: 4332000,
  timeZone: "Europe/Rome",
});
