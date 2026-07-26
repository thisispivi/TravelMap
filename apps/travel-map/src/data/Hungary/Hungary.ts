import { Continent, Country, Currency } from "@travelmap/core";

export const Hungary = new Country({
  id: "Hungary",
  color: { h: 21, s: 90, l: 48 }, // Warm orange for paprika fields
  continent: Continent.EUROPE,
  currency: Currency.HUF,
});
