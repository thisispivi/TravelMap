import { localize } from "../typings/Localized";
import { MarkerSizes } from "../typings/Marker";
import { Country } from "./Country";

/**
 * Data used to construct a city.
 * @property {string[]} [backgroundImgSources] - Background images shown for the city
 * @property {[number, number]} coordinates - Longitude and latitude
 * @property {Country} country - The country containing the city
 * @property {MarkerSizes} [customMarkerSizes] - Custom map marker dimensions
 * @property {boolean} [isLived] - Whether the city is a former home
 * @property {string} [id] - The stable city identifier used in URLs and references
 * @property {number} [minMarkerScale] - The minimum visible marker scale
 * @property {string} name - The city name
 * @property {Record<string, string>} [nameByLocale] - Locale-specific display names
 * @property {number} [population] - The city population
 * @property {string} timeZone - The IANA time-zone identifier
 */
interface CityInterface {
  backgroundImgSources?: string[];
  coordinates: [number, number];
  country: Country;
  customMarkerSizes?: MarkerSizes;
  isLived?: boolean;
  id?: string;
  minMarkerScale?: number;
  name: string;
  nameByLocale?: Record<string, string>;
  population?: number;
  timeZone: string;
}

/**
 * The city class is used to represent a city.
 * @class
 * @param {CityInterface} cityData - The data of the city
 * @param {string[]} [cityData.backgroundImgSources] - The background image source of the city
 * @param {[number, number]} cityData.coordinates - The city coordinates as longitude and latitude
 * @param {Country} cityData.country - The country of the city
 * @param {MarkerSizes} [cityData.customMarkerSizes] - The custom marker sizes of the city
 * @param {boolean} [cityData.isLived] - If the city is lived
 * @param {string} [cityData.id] - The stable city identifier
 * @param {number} [cityData.minMarkerScale] - The minimum scale of the city marker
 * @param {string} cityData.name - The name of the city
 * @param {Record<string, string>} [cityData.nameByLocale] - Locale-specific display names
 * @param {number} [cityData.population] - The population of the city
 * @param {string} cityData.timeZone - The IANA time zone id of the city
 */
export class City implements CityInterface {
  backgroundImgSources: string[];
  coordinates: [number, number];
  customMarkerSizes?: MarkerSizes | undefined;
  country: Country;
  id: string;
  isLived?: boolean | undefined;
  mapCoordinates: [number, number];
  minMarkerScale?: number;
  name: string;
  nameByLocale?: Record<string, string>;
  population?: number;
  timeZone: string;

  /**
   * Creates a city instance.
   * @param {CityInterface} cityData - The city data
   */
  constructor(cityData: CityInterface) {
    this.coordinates = cityData.coordinates;
    this.customMarkerSizes = cityData.customMarkerSizes;
    this.country = cityData.country;
    this.id = cityData.id ?? cityData.name;
    this.isLived = cityData.isLived;
    this.mapCoordinates = this.getMapCoordinates(this.coordinates);
    this.minMarkerScale = cityData.minMarkerScale;
    this.name = cityData.name;
    this.nameByLocale = cityData.nameByLocale;
    this.population = cityData.population;
    this.timeZone = cityData.timeZone;
    this.backgroundImgSources = cityData.backgroundImgSources ?? [];
  }

  /**
   * Returns coordinates in MapLibre's longitude-latitude order.
   * @param {[number, number]} coordinates - The longitude and latitude
   * @returns {[number, number]} The unchanged MapLibre coordinates
   */
  getMapCoordinates(coordinates: [number, number]): [number, number] {
    const [x, y] = coordinates;
    return [x, y];
  }

  /**
   * Resolves a city background image from a cyclic travel index.
   * @param {number} index - The travel index used to select an image
   * @returns {string | null} The CDN image source, or null when none exist
   */
  getBackgroundImgSourceByIndex(index: number): string | null {
    if (this.backgroundImgSources.length === 0) return null;
    return `${import.meta.env.VITE_CDN_PATH}${this.backgroundImgSources[index % this.backgroundImgSources.length]}`;
  }

  /**
   * Converts the city's coordinate tuple into a named latitude/longitude object.
   * @returns {{ lat: number; lon: number }} The named geographic coordinates
   */
  getCoordinatesAsLatLon(): { lat: number; lon: number } {
    return { lat: this.coordinates[1], lon: this.coordinates[0] };
  }

  /**
   * Resolves the city's display name for a locale.
   * @param {string} locale - The active locale
   * @returns {string} The localized or canonical city name
   */
  getLocalizedName(locale: string): string {
    return localize(this, locale);
  }
}
