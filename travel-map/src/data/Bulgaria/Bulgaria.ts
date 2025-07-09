import { Continent, Country, Currency } from "../../core";

export const Bulgaria = new Country({
  id: "Bulgaria",
  color: { h: 120, s: 70, l: 45 },
  continent: Continent.EUROPE,
  currency: Currency.BGN,
});
