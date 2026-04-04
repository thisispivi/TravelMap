import { Continent, Country, Currency } from "../../core";

export const Sweden = new Country({
  id: "Sweden",
  color: { h: 210, s: 90, l: 40 }, // Blue for Swedish lakes and coast
  continent: Continent.EUROPE,
  currency: Currency.SEK,
});
