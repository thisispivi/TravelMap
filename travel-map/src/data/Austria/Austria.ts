import { Continent, Country, Currency } from "../../core";

export const Austria = new Country({
  id: "Austria",
  color: { h: 258, s: 50, l: 52 }, // Soft purple for alpine flowers
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
