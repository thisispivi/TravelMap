import { i18n } from "i18next";
import { Country } from "./Country";
import { Travel } from "./Travel";
import { MarkerSizes } from "../typings/Marker";

interface CityInterface {
  backgroundImgsSrc?: string[];
  coordinates: [number, number];
  country: Country;
  customMarkerSizes?: MarkerSizes;
  isLived?: boolean;
  name: string;
  travels?: Travel[];
  population?: number;
}

/**
 * City class
 *
 * The city class is used to represent a city.
 *
 * @class
 *
 * @param {CityInterface} cityData - The data of the city
 * @param {string[]} [cityData.backgroundImgsSrc] - The background image source of the city
 * @param {MarkerSizes} [cityData.customMarkerSizes] - The custom marker sizes of the city
 * @param {coordinates} cityData.coordinates - The coordinates of the city [longitude, latitude]
 * @param {Country} cityData.country - The country of the city
 * @param {boolean} [cityData.isLived] - If the city is lived
 * @param {string} cityData.name - The name of the city
 * @param {Travel[]} [cityData.travels] - The travels of the city
 * @param {number} [cityData.population] - The population of the city
 */
export class City implements CityInterface {
  backgroundImgsSrc: string[];
  coordinates: [number, number];
  customMarkerSizes?: MarkerSizes | undefined;
  country: Country;
  isLived?: boolean | undefined;
  mapCoordinates: [number, number];
  name: string;
  travels: Travel[];
  population?: number;

  constructor(cityData: CityInterface) {
    this.backgroundImgsSrc = cityData.backgroundImgsSrc ?? [];
    this.coordinates = cityData.coordinates;
    this.customMarkerSizes = cityData.customMarkerSizes;
    this.country = cityData.country;
    this.isLived = cityData.isLived;
    this.mapCoordinates = this.getMapCoordinates(this.coordinates);
    this.name = cityData.name;
    this.travels = cityData.travels ?? [];
    this.population = cityData.population;
  }

  getMapCoordinates([x, y]: [number, number]): [number, number] {
    return [x - 0.95, y + 0.18];
  }

  getCoordinatesAsLatLon(): { lat: number; lon: number } {
    return { lat: this.coordinates[1], lon: this.coordinates[0] };
  }

  getName(t: i18n["t"]) {
    return t(`cities.${this.name}`);
  }

  addTravel(travel: Travel) {
    this.travels.push(travel);
    this.travels.sort((a, b) => a.sDate.getTime() - b.sDate.getTime());
  }
}
