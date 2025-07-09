import { Continent, Country, Currency } from "../../core";

export const Spain = new Country({
  id: "Spain",
  color: { h: 358, s: 78, l: 35 }, // Deep red representing Spanish heritage
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
