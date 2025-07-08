import { Continent, Country, Currency } from "../../core";

export const Japan = new Country({
  id: "Japan",
  color: { h: 348, s: 81, l: 83 },
  continent: Continent.ASIA,
  currency: Currency.JPY,
});
