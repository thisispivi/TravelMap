import { i18n } from "i18next";
import { Color, ColorData } from "./Color";
import { Continent } from "../typings/Continent";

export interface CountryData {
  id: string;
  borderColor: string;
  fillColor: string;
  continent: Continent;
  minMarkerScale?: number;
  maxMarkerScale?: number;
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
 * @param {number} countryData.minMarkerScale - The minimum scale of the marker
 * @param {number} countryData.maxMarkerScale - The maximum scale of the marker
 */
export class Country {
  id: string;
  borderColor: string;
  fillColor: string;
  continent: Continent;
  minMarkerScale?: number;
  maxMarkerScale?: number;

  constructor(
    id: string,
    color: ColorData,
    continent: Continent,
    minMarkerScale?: number,
    maxMarkerScale?: number
  ) {
    this.id = id;
    this.borderColor = new Color(color).toHSL();
    this.fillColor = new Color(color).toHSLA(0.5);
    this.continent = continent;
    this.minMarkerScale = minMarkerScale;
    this.maxMarkerScale = maxMarkerScale;
  }

  getName(t: i18n["t"]) {
    return t(`countries.${this.id}`);
  }
}
