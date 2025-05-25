import { Continent, Country, Currency } from "../../core";

export const Austria = new Country({
  id: "Austria",
  color: { h: 352, s: 89, l: 70 },
  continent: Continent.Europe,
  timezoneGMT: 1,
  currency: Currency.EUR,
});
