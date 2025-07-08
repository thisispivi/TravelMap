import { Continent, Country, Currency } from "../../core";

export const Malta = new Country({
  id: "Malta",
  color: { h: 352, s: 77, l: 46 },
  continent: Continent.EUROPE,
  minMarkerScale: 0.01,
  currency: Currency.EUR,
});
