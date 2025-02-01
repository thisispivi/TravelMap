import { Continent, Country } from "../../core";

export const Vatican = new Country({
  id: "Vatican",
  color: { h: 48, s: 99, l: 51 },
  continent: Continent.Europe,
  timezoneGMT: 1,
});
