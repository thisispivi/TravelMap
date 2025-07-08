import { i18n } from "i18next";
import { Color, ColorData } from "./Color";
import { Continent } from "../typings/Continent";
import { Currency } from "../typings/Currency";

export interface CountryData {
  id: string;
  color: ColorData;
  continent: Continent;
  minMarkerScale?: number;
  maxMarkerScale?: number;
  currency: Currency;
}

/**
 * Country class
 *
 * The country class is used to represent a country.
 *
 * @class
 *
 * @param {CountryData} countryData - The data of the country
 * @param {string} countryData.id - The id of the country
 * @param {ColorData} countryData.color - The color of the country
 * @param {Continent} countryData.continent - The continent of the country
 * @param {number} [countryData.minMarkerScale] - The minimum scale of the marker
 * @param {number} [countryData.maxMarkerScale] - The maximum scale of the marker
 * @param {Currency} countryData.currency - The currency of the country
 */
export class Country {
  id: string;
  borderColor: string;
  fillColor: string;
  continent: Continent;
  minMarkerScale?: number;
  maxMarkerScale?: number;
  currency: Currency;

  constructor(
    data: Partial<CountryData> &
      Pick<CountryData, "id" | "continent" | "color" | "currency">
  ) {
    this.id = data.id;
    this.borderColor = new Color(data.color).toHSL();
    this.fillColor = new Color(data.color).toHSLA(0.6);
    this.continent = data.continent;
    this.minMarkerScale = data?.minMarkerScale;
    this.maxMarkerScale = data?.maxMarkerScale;
    this.currency = data.currency;
  }

  getName(t: i18n["t"]) {
    return t(`countries.${this.id}`);
  }
}
