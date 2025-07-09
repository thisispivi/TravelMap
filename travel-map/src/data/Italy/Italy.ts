import { Continent, Country, Currency } from "../../core";

export const Italy = new Country({
  id: "Italy",
  color: { h: 84, s: 81, l: 44 }, // Sage green for olive groves
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
