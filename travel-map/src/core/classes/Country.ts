import { i18n } from "i18next";

import { Continent } from "../typings/Continent";
import { Currency } from "../typings/Currency";
import { Color, ColorData } from "./Color";

/**
 * Data represented by the country data interface.
 * @property {string} id - The id
 * @property {ColorData} color - The color
 * @property {Continent} continent - The continent
 * @property {number} [minMarkerScale] - The min marker scale
 * @property {number} [maxMarkerScale] - The max marker scale
 * @property {Currency} currency - The currency
 */
interface CountryData {
  id: string;
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
 * @param {ColorData} data.color - The color of the country
 * @param {Continent} data.continent - The continent of the country
 * @param {number} [data.minMarkerScale] - The minimum scale of the marker
 * @param {number} [data.maxMarkerScale] - The maximum scale of the marker
 * @param {Currency} data.currency - The currency of the country
 */
export class Country {
  id: string;
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
    this.borderColor = new Color(data.color).toHSL();
    this.fillColor = new Color(data.color).toHSLA(0.6);
    this.continent = data.continent;
    this.minMarkerScale = data?.minMarkerScale;
    this.maxMarkerScale = data?.maxMarkerScale;
    this.currency = data.currency;
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
