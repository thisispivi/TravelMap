import { Continent, Country, Currency } from "../../core";

export const UnitedKingdom = new Country({
  id: "United Kingdom",
  color: { h: 224, s: 76, l: 48 }, // Royal blue for heritage and navy
  continent: Continent.EUROPE,
  currency: Currency.GBP,
});
