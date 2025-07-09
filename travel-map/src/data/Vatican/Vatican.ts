import { Continent, Country, Currency } from "../../core";

export const Vatican = new Country({
  id: "Vatican",
  color: { h: 45, s: 93, l: 47 }, // Golden yellow for papal gold
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
