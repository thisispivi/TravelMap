import { Continent, Country, Currency } from "../../core";

export const Slovakia = new Country({
  id: "Slovakia",
  color: { h: 210, s: 60, l: 50 }, // Blue representing the Carpathian Mountains
  continent: Continent.EUROPE,
  currency: Currency.EUR,
});
