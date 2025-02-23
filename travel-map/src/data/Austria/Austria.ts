import { Continent, Country, Currency } from "../../core";

export const Austria = new Country({
  id: "Austria",
  color: { h: 36, s: 100, l: 50 },
  continent: Continent.Europe,
  timezoneGMT: 1,
  currency: Currency.EUR,
});
