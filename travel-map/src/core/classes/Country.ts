import { i18n } from "i18next";
import { Color, ColorData } from "./Color";

export interface CountryData {
  id: string;
  name: string;
  borderColor: string;
  fillColor: string;
}

/**
 * Country class
 *
 * The country class is used to represent a country.
 *
 * @class
 *
 * @param {CountryData} countryData - The data of the country
 * @param {string} countryData.name - The name of the country
 * @param {string} countryData.id - The id of the country
 * @param {ColorData} countryData.color - The color of the country
 *
 */
export class Country {
  id: string;
  name: string;
  borderColor: string;
  fillColor: string;

  constructor(name: string, id: string, color: ColorData) {
    this.id = id;
    this.borderColor = new Color(color).toHSL();
    this.fillColor = new Color(color).toHSLA(0.5);
    this.name = name;
  }

  getName(t: i18n["t"]) {
    return t(`countries.${this.name}`);
  }
}
