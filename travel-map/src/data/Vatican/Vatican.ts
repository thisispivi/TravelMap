import { Continent, Country, Currency } from "../../core";

export const Vatican = new Country({
  id: "Vatican",
  color: { h: 48, s: 99, l: 51 },
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
