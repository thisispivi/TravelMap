import { Continent, Country, Currency } from "../../core";

export const Australia = new Country({
  id: "Australia",
  color: { h: 45, s: 85, l: 65 }, // Golden yellow for Australia's sports kit
  continent: Continent.OCEANIA,
  currency: Currency.AUD,
});
