import { Continent, Country } from "../../core";

export const Germany = new Country({
  id: "Germany",
  color: { h: 290, s: 70, l: 40 },
  continent: Continent.Europe,
  timezoneGMT: 1,
});
