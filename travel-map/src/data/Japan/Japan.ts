import { Continent, Country, Currency } from "../../core";

export const Japan = new Country({
  id: "Japan",
  color: { h: 329, s: 86, l: 70 }, // Soft pink for cherry blossoms
  continent: Continent.ASIA,
  currency: Currency.JPY,
});
