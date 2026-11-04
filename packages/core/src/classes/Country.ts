import { Continent } from "../typings/Continent.ts";
import { Currency } from "../typings/Currency.ts";
import { localize } from "../typings/Localized.ts";
import { Color, ColorData } from "./Color.ts";
import { Stamp, StampData } from "./Stamp.ts";

/** The colour of an ordinary passport's cover: the four almost every country uses. */
export type PassportCover = "red" | "blue" | "green" | "black";

/**
 * A country as the catalogue writes it, under its code and its continent.
 * @property {string} name - Its English name
 * @property {Record<string, string>} [nameByLocale] - Its names in other locales
 * @property {string} [mapName] - The map polygon's name, where it differs from `name`
 * @property {Currency} [currency] - Its currency, absent where nobody issues one
 * @property {ColorData} color - Its colour on the map and on its stamp
 * @property {PassportCover} [passportCover] - Its passport's cover, burgundy when absent
 * @property {StampData} stamp - How its stamp is struck
 */
export interface CountryEntry {
  name: string;
  nameByLocale?: Record<string, string>;
  mapName?: string;
  currency?: Currency;
  color: ColorData;
  passportCover?: PassportCover;
  stamp: StampData;
}

/**
 * A country of the world map, with everything the site shows about it.
 * @class
 * @param {string} id - Its ISO 3166-1 alpha-2 code, or an X code for a disputed territory
 * @param {Continent} continent - Its continent
 * @param {CountryEntry} entry - Its catalogue entry
 */
export class Country {
  id: string;
  name: string;
  nameByLocale?: Record<string, string>;
  mapName: string;
  continent: Continent;
  currency?: Currency;
  color: ColorData;
  borderColor: string;
  fillColor: string;
  passportCover: PassportCover;
  stamp: Stamp;

  /**
   * Creates a country from its catalogue entry.
   * @param {string} id - Its code
   * @param {Continent} continent - Its continent
   * @param {CountryEntry} entry - Its catalogue entry
   */
  constructor(id: string, continent: Continent, entry: CountryEntry) {
    this.id = id;
    this.name = entry.name;
    this.nameByLocale = entry.nameByLocale;
    this.mapName = entry.mapName ?? entry.name;
    this.continent = continent;
    this.currency = entry.currency;
    this.color = entry.color;
    this.borderColor = new Color(entry.color).toHSL();
    this.fillColor = new Color(entry.color).toHSLA(0.6);
    this.passportCover = entry.passportCover ?? "red";
    this.stamp = new Stamp(id, entry.stamp);
  }

  /**
   * Resolves the country's display name for a locale.
   * @param {string} locale - The active locale
   * @returns {string} The localized or canonical country name
   */
  getLocalizedName(locale: string): string {
    return localize(this, locale);
  }
}
