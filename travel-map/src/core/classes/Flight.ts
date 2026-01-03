import { getCitiesDistance } from "../../utils/distance";
import { FlightCompany } from "../typings/FlightCompany";
import { getTravelTypeByStartAndEndCity, TravelType } from "../typings/Travel";
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
 * @param {TravelType} flightData.travelType - The type of the travel
 * @param {number} flightData.distanceInKm - The distance of the flight in kilometers
 * @param {FlightCompany} flightData.company - The company of the flight
 */
export class Flight implements FlightInterface {
  sCity: City;
  eCity: City;
  travelType: TravelType;
  distanceInKm: number = 0;
  company: FlightCompany;

  constructor({ sCity, eCity, company }: FlightInterface) {
    this.sCity = sCity;
    this.eCity = eCity;
    this.travelType = getTravelTypeByStartAndEndCity(sCity, eCity);
    this.distanceInKm = getCitiesDistance(sCity, eCity);
    this.company = company;
  }
}
