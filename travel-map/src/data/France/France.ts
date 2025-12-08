import { Continent, Country, Currency } from "../../core";

export const France = new Country({
  id: "France",
  color: { h: 280, s: 60, l: 60 }, // Lavender for French elegance and sophistication
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
