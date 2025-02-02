import { Continent, Country, Currency } from "../../core";

export const UnitedKingdom = new Country({
  id: "United Kingdom",
  color: { h: 352, s: 78, l: 46 },
  continent: Continent.Europe,
  timezoneGMT: 0,
  currency: Currency.GBP,
});
