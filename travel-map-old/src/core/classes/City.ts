import { i18n } from "i18next";
import { Country } from "./Country";
import { Travel } from "./Travel";

interface CityInterface {
  name: string;
  country: Country;
  coordinates: [number, number];
  travels?: Travel[];
}

export class City implements CityInterface {
  name: string;
  country: Country;
  coordinates: [number, number];
  travels: Travel[];

  constructor(cityData: CityInterface) {
    this.name = cityData.name;
    this.country = cityData.country;
    this.coordinates = cityData.coordinates;
    this.travels = cityData.travels ?? [];
  }

  getCountryName(t: i18n["t"]) {
    return t(`cities.${this.name}`);
  }

  addTravel(travel: Travel) {
    this.travels.push(travel);
    this.travels.sort((a, b) => a.sDate.getTime() - b.sDate.getTime());
  }
}
