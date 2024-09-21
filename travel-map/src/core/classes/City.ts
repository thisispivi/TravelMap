import { i18n } from "i18next";
import { Country } from "./Country";
import { Travel } from "./Travel";

interface CityInterface {
  name: string;
  country: Country;
  coordinates: [number, number];
  travels?: Travel[];
  backgroundImgsSrc?: string[];
  mapCoordinates?: [number, number];
  isLived?: boolean;
}

/**
 * City class
 *
 * The city class is used to represent a city.
 *
 * @class
 *
 * @param {CityInterface} cityData - The data of the city
 * @param {string} cityData.name - The name of the city
 * @param {Country} cityData.country - The country of the city
 * @param {[number, number]} cityData.coordinates - The coordinates of the city [longitude, latitude]
 * @param {Travel[]} [cityData.travels] - The travels of the city
 * @param {string[]} [cityData.backgroundImgsSrc] - The background image source of the city
 * @param {[number, number]} [cityData.mapCoordinates] - The map coordinates of the city
 * @param {boolean} [cityData.isLived] - If the city is lived
 */
export class City implements CityInterface {
  name: string;
  country: Country;
  coordinates: [number, number];
  travels: Travel[];
  backgroundImgsSrc: string[];
  mapCoordinates?: [number, number];
  isLived?: boolean | undefined;

  constructor(cityData: CityInterface) {
    this.name = cityData.name;
    this.country = cityData.country;
    this.coordinates = cityData.coordinates;
    this.travels = cityData.travels ?? [];
    this.backgroundImgsSrc = cityData.backgroundImgsSrc ?? [];
    this.mapCoordinates = cityData.mapCoordinates;
    this.isLived = cityData.isLived;
  }

  getName(t: i18n["t"]) {
    return t(`cities.${this.name}`);
  }

  addTravel(travel: Travel) {
    this.travels.push(travel);
    this.travels.sort((a, b) => a.sDate.getTime() - b.sDate.getTime());
  }
}
