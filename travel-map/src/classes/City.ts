import { i18n } from "i18next";
import { Country } from "./Country";

interface CityInterface {
  name: string;
  country: Country;
  population: number;
  coordinates: [number, number];
  startDate: Date;
  endDate: Date;
}

export class City implements CityInterface {
  name: string;
  country: Country;
  population: number;
  coordinates: [number, number];
  startDate: Date;
  endDate: Date;

  constructor(
    name: string,
    country: Country,
    population: number,
    coordinates: [number, number],
    startDate: Date,
    endDate: Date
  ) {
    this.name = name;
    this.country = country;
    this.population = population;
    this.coordinates = coordinates;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  getCountryName(t: i18n["t"]) {
    return t(`cities.${this.name}`);
  }
}
