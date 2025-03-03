import { Continent, Country, Currency } from "../../core";

export const Hungary = new Country({
  id: "Hungary",
  color: { h: 88, s: 50, l: 53 },
  continent: Continent.Europe,
  timezoneGMT: 1,
  currency: Currency.HUF,
});
