import { CountryEntry } from "../classes/Country.ts";
import { Currency } from "../typings/Currency.ts";

/** The countries of Antarctica, by ISO 3166-1 alpha-2 code. */
export const ANTARCTICA: Record<string, CountryEntry> = {
  AQ: {
    name: "Antarctica",
    nameByLocale: { "it-IT": "Antartide" },
    color: { h: 216, s: 65, l: 50 },
    stamp: { frame: "pentagon", textStyle: "caps" },
  },
  HM: {
    name: "Heard and McDonald",
    nameByLocale: { "it-IT": "Heard e McDonald" },
    mapName: "Heard I. and McDonald Is.",
    currency: Currency.AUD,
    color: { h: 243, s: 80, l: 50 },
    stamp: { frame: "circle", textStyle: "curved" },
  },
  TF: {
    name: "French Southern Lands",
    nameByLocale: { "it-IT": "Terre Australi Francesi" },
    mapName: "Fr. S. Antarctic Lands",
    currency: Currency.EUR,
    color: { h: 226, s: 80, l: 50 },
    stamp: { frame: "octagon", textStyle: "caps" },
  },
};
