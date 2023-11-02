import { i18n } from "i18next";

export interface Color {
  h: number;
  s: number;
  l: number;
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
    this.borderColor = `hsl(${color.h}, ${color.s}%, ${color.l - 10}%)`;
    this.fillColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
  }

  getName(t: i18n["t"]) {
    return t(`countries.${this.id}`);
  }
}
