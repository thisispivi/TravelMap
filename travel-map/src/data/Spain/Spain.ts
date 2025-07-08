import { Continent, Country, Currency } from "../../core";

export const Spain = new Country({
  id: "Spain",
  color: { h: 46, s: 100, l: 52 },
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
