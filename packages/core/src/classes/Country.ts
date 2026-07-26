import { i18n } from "i18next";

import { Continent } from "../typings/Continent";
import { Currency } from "../typings/Currency";
import { localize } from "../typings/Localized";
import { Color, ColorData } from "./Color";

/**
 * Data represented by the country data interface.
 * @property {string} id - The id
 * @property {string} [name] - The canonical country name used by the map join
 * @property {Record<string, string>} [nameByLocale] - Locale-specific display names
 * @property {ColorData} color - The color
 * @property {Continent} continent - The continent
 * @property {number} [minMarkerScale] - The min marker scale
 * @property {number} [maxMarkerScale] - The max marker scale
 * @property {Currency} currency - The currency
 */
interface CountryData {
  id: string;
  name?: string;
  nameByLocale?: Record<string, string>;
  color: ColorData;
  continent: Continent;
  minMarkerScale?: number;
  maxMarkerScale?: number;
  currency: Currency;
}

/**
 * The country class is used to represent a country.
 * @class
 * @param {CountryData} data - The data of the country
 * @param {string} data.id - The id of the country
 * @param {string} [data.name] - The canonical country name
 * @param {Record<string, string>} [data.nameByLocale] - Locale-specific display names
 * @param {ColorData} data.color - The color of the country
 * @param {Continent} data.continent - The continent of the country
 * @param {number} [data.minMarkerScale] - The minimum scale of the marker
 * @param {number} [data.maxMarkerScale] - The maximum scale of the marker
 * @param {Currency} data.currency - The currency of the country
 */
export class Country {
  id: string;
  name: string;
  nameByLocale?: Record<string, string>;
  color: ColorData;
  borderColor: string;
  fillColor: string;
  continent: Continent;
  minMarkerScale?: number;
  maxMarkerScale?: number;
  currency: Currency;

  /**
   * Creates a country instance.
   * @param {Partial<CountryData> & Pick<CountryData, "id" | "continent" | "color" | "currency">} data - The data
   */
  constructor(
    data: Partial<CountryData> &
      Pick<CountryData, "id" | "continent" | "color" | "currency">,
  ) {
    this.id = data.id;
    this.name = data.name ?? data.id;
    this.nameByLocale = data.nameByLocale;
    this.color = data.color;
    this.borderColor = new Color(data.color).toHSL();
    this.fillColor = new Color(data.color).toHSLA(0.6);
    this.continent = data.continent;
    this.minMarkerScale = data?.minMarkerScale;
    this.maxMarkerScale = data?.maxMarkerScale;
    this.currency = data.currency;
  }

  /**
   * Resolves the country's display name for a locale.
   * @param {string} locale - The active locale
   * @returns {string} The localized or canonical country name
   */
  getLocalizedName(locale: string): string {
    return localize(this, locale);
  }

  /**
   * Translates the country's canonical identifier for display.
   * @param {i18n["t"]} t - The active i18next translation function
   * @returns {string} The localized country name
   */
  getName(t: i18n["t"]): string {
    return t(`countries.${this.id}`);
  }
}
