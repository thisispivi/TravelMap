import { getCitiesDistance } from "../../utils/distance";
import { FlightCompany } from "../typings/FlightCompany";
import { City } from "./City";

export interface FlightInterface {
  sCity: City;
  eCity: City;
  company: FlightCompany;
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
 * @param {FlightCompany} flightData.company - The company of the flight
 */
export class Flight implements FlightInterface {
  sCity: City;
  eCity: City;
  isNational: boolean = false;
  isInternational: boolean = false;
  isIntercontinental: boolean = false;
  distanceInKm: number = 0;
  company: FlightCompany;

  constructor({ sCity, eCity, company }: FlightInterface) {
    const isIntercontinental =
      sCity.country.continent !== eCity.country.continent;
    this.sCity = sCity;
    this.eCity = eCity;
    this.isNational = sCity.country === eCity.country;
    this.isInternational =
      sCity.country !== eCity.country && !isIntercontinental;
    this.isIntercontinental = isIntercontinental;
    this.distanceInKm = getCitiesDistance(sCity, eCity);
    this.company = company;
  }
}
