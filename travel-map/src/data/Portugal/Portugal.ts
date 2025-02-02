import { Continent, Country, Currency } from "../../core";

export const Portugal = new Country({
  id: "Portugal",
  color: { h: 120, s: 86, l: 23 },
  continent: Continent.Europe,
  timezoneGMT: 0,
  currency: Currency.EUR,
});
