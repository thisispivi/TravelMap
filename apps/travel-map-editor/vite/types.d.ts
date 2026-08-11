declare module "all-the-cities" {
  /**
   * One gazetteer entry, as shipped by the package.
   * @property {string} adminCode - The first-level administrative division code
   * @property {string} altName - An alternative name, often empty
   * @property {number} cityId - The GeoNames identifier
   * @property {string} country - The ISO 3166-1 alpha-2 country code
   * @property {string} featureCode - The GeoNames feature code
   * @property {{ coordinates: [number, number]; type: string }} loc - The point geometry, longitude first
   * @property {string} name - The city name
   * @property {number} population - Inhabitants
   */
  interface City {
    adminCode: string;
    altName: string;
    cityId: number;
    country: string;
    featureCode: string;
    loc: { coordinates: [number, number]; type: string };
    name: string;
    population: number;
  }

  const cities: City[];
  export default cities;
}

declare module "tz-lookup" {
  /**
   * Resolves the IANA timezone covering a coordinate.
   * @param {number} latitude - The latitude in degrees
   * @param {number} longitude - The longitude in degrees
   * @returns {string} The IANA timezone name
   */
  export default function tzLookup(latitude: number, longitude: number): string;
}
