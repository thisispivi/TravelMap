import { haversineDistance } from "../../utils/distance";
import { City } from "./City";

export interface FlightInterface {
  sCity: City;
  eCity: City;
}

/**
 * Flight class
 *
 * The flight class is used to represent a flight.
 *
 * @class
 *
 * @param {FlightInterface} flightData - The data of the flight
 * @param {City} flightData.sCity - The start city of the flight
 * @param {City} flightData.eCity - The end city of the flight
 * @param {boolean} flightData.isNational - If the flight is national
 * @param {boolean} flightData.isInternational - If the flight is international
 * @param {boolean} flightData.isIntercontinental - If the flight is intercontinental
 * @param {number} flightData.distanceInKm - The distance of the flight in kilometers
 */
export class Flight implements FlightInterface {
  sCity: City;
  eCity: City;
  isNational: boolean = false;
  isInternational: boolean = false;
  isIntercontinental: boolean = false;
  distanceInKm: number = 0;

  constructor({ sCity, eCity }: FlightInterface) {
    this.sCity = sCity;
    this.eCity = eCity;
    this.isNational = sCity.country === eCity.country;
    this.isInternational = sCity.country !== eCity.country;
    this.isIntercontinental =
      sCity.country.continent !== eCity.country.continent;
    this.distanceInKm = haversineDistance(
      sCity.coordinates[1],
      sCity.coordinates[0],
      eCity.coordinates[1],
      eCity.coordinates[0],
    );
  }
}
