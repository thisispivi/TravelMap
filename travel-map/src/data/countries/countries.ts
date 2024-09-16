import { Country } from "../../core";
import { Continent } from "../../core/typings/Continent";

export const Belgium = new Country(
  "Belgium",
  { h: 36, s: 100, l: 50 },
  Continent.Europe
);

export const Spain = new Country(
  "Spain",
  { h: 175, s: 92, l: 24 },
  Continent.Europe
);

export const Italy = new Country(
  "Italy",
  { h: 5, s: 80, l: 67 },
  Continent.Europe
);

export const Hungary = new Country(
  "Hungary",
  { h: 88, s: 50, l: 53 },
  Continent.Europe
);

export const Germany = new Country(
  "Germany",
  { h: 290, s: 70, l: 40 },
  Continent.Europe
);

export const UnitedKingdom = new Country(
  "United Kingdom",
  {
    h: 201,
    s: 80,
    l: 47,
  },
  Continent.Europe
);

export const Portugal = new Country(
  "Portugal",
  { h: 66, s: 70, l: 54 },
  Continent.Europe
);

export const Japan = new Country(
  "Japan",
  { h: 348, s: 81, l: 83 },
  Continent.Asia
);
