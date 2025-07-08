import { Continent, Country, Currency } from "../../core";

export const Germany = new Country({
  id: "Germany",
  color: { h: 290, s: 70, l: 40 },
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
