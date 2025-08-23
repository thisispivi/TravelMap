import { Continent, Country, Currency } from "../../core";

export const Bulgaria = new Country({
  id: "Bulgaria",
  color: { h: 330, s: 70, l: 70 }, // Rose pink for Bulgaria's Valley of Roses
  continent: Continent.EUROPE,
  currency: Currency.BGN,
});
