import { Continent, Country, Currency } from "../../core";

export const Romania = new Country({
  id: "Romania",
  color: { h: 48, s: 95, l: 55 }, // Yellow for Romania flag
  continent: Continent.EUROPE,
  currency: Currency.RON,
});
