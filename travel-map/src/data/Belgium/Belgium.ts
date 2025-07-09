import { Continent, Country, Currency } from "../../core";

export const Belgium = new Country({
  id: "Belgium",
  color: { h: 38, s: 92, l: 50 }, // Golden yellow for Belgian beer and heritage
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
