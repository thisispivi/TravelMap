import { Continent, Country, Currency } from "../../core";

export const Germany = new Country({
  id: "Germany",
  color: { h: 161, s: 94, l: 30 }, // Forest green for Black Forest
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
