import { i18n } from "i18next";
import { Country } from "./Country";

interface CityInterface {
  name: string;
  country: Country;
  population: number;
  coordinates: [number, number];
  travels: [Date, Date][];
}

export class City implements CityInterface {
  name: string;
  country: Country;
  population: number;
  coordinates: [number, number];
  travels: [Date, Date][];

  constructor(
    name: string,
    country: Country,
    population: number,
    coordinates: [number, number],
    travels: [Date, Date][]
  ) {
    this.name = name;
    this.country = country;
    this.population = population;
    this.coordinates = coordinates;
    this.travels = travels;
  }

  getCountryName(t: i18n["t"]) {
    return t(`cities.${this.name}`);
  }
}
