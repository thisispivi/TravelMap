import { Continent, Country, Currency } from "../../core";

export const Italy = new Country({
  id: "Italy",
  color: { h: 228, s: 64, l: 45 },
  continent: Continent.Europe,
  timezoneGMT: 1,
  currency: Currency.EUR,
});
