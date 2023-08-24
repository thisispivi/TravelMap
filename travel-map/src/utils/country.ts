import { i18n } from "i18next";

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface CountryData {
  id: string;
  borderColor: string;
  fillColor: string;
}

export class Country {
  id: string;
  borderColor: string;
  fillColor: string;

  constructor(id: string, color: Color) {
    this.id = id;
    this.borderColor = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
    this.fillColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`;
  }

  getName(t: i18n["t"]) {
    return t(`countries.${this.id}`);
  }
}
