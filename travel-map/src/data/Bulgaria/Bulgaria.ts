import { Continent, Country, Currency } from "../../core";

export const Bulgaria = new Country({
  id: "Bulgaria",
  color: { h: 164, s: 100, l: 29 }, // Teal for Balkan mountains
  continent: Continent.EUROPE,
  currency: Currency.BGN,
});
