import { Continent, Country, Currency } from "../../core";

export const Portugal = new Country({
  id: "Portugal",
  color: { h: 120, s: 61, l: 34 }, // Green from Portuguese flag
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
