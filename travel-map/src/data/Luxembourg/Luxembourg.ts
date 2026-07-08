import { Continent, Country, Currency } from "../../core";

export const Luxembourg = new Country({
  id: "Luxembourg",
  color: { h: 195, s: 85, l: 43 },
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
