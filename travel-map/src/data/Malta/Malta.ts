import { Continent, Country, Currency } from "../../core";

export const Malta = new Country({
  id: "Malta",
  color: { h: 355, s: 78, l: 32 }, // Deep red for Malta's flag
  continent: Continent.EUROPE,
  minMarkerScale: 0.01,
  currency: Currency.EUR,
});
