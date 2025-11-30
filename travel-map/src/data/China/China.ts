import { Continent, Country, Currency } from "../../core";

export const China = new Country({
  id: "China",
  color: { h: 0, s: 100, l: 50 }, // Red for China
  continent: Continent.ASIA,
  currency: Currency.CNY,
});
