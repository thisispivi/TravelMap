import { i18n } from "i18next";

import { Continent } from "../typings/Continent";
import { Currency } from "../typings/Currency";
import { Color, ColorData } from "./Color";

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

  getName(t: i18n["t"]) {
    return t(`countries.${this.id}`);
  }
}
