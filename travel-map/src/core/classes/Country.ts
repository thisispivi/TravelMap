import { i18n } from "i18next";
import { Color, ColorData } from "./Color";
import { Continent } from "../typings/Continent";

export interface CountryData {
  id: string;
  borderColor: string;
  fillColor: string;
  continent: Continent;
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
 */
export class Country {
  id: string;
  borderColor: string;
  fillColor: string;
  continent: Continent;

  constructor(id: string, color: ColorData, continent: Continent) {
    this.id = id;
    this.borderColor = new Color(color).toHSL();
    this.fillColor = new Color(color).toHSLA(0.5);
    this.continent = continent;
  }

  getName(t: i18n["t"]) {
    return t(`countries.${this.id}`);
  }
}
