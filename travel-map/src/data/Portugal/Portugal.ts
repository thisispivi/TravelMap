import { Continent, Country, Currency } from "../../core";

export const Portugal = new Country({
  id: "Portugal",
  color: { h: 120, s: 86, l: 23 },
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
