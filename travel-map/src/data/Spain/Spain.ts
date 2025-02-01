import { Continent, Country } from "../../core";

export const Spain = new Country({
  id: "Spain",
  color: { h: 46, s: 100, l: 52 },
  continent: Continent.Europe,
  timezoneGMT: 1,
});
