import { Continent, Country, Currency } from "../../core";

export const Monaco = new Country({
  id: "Monaco",
  color: { h: 0, s: 100, l: 50 }, // Red for Monaco
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
