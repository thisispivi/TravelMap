import { i18n } from "i18next";
import { Color, ColorData } from "./Color";

export interface CountryData {
  id: string;
  borderColor: string;
  fillColor: string;
}

export class Country {
  id: string;
  borderColor: string;
  fillColor: string;

  constructor(id: string, color: ColorData) {
    this.id = id;
    this.borderColor = new Color(color).toHSL();
    this.fillColor = new Color(color).toHSLA(0.5);
  }

  getName(t: i18n["t"]) {
    return t(`countries.${this.id}`);
  }
}
