import { getCitiesDistance } from "../world/distance";

import { getTravelTypeByStartAndEndCity, TravelType } from "../typings/Travel";
import { City } from "./City";

/**
 * Data used to construct a flight.
 * @property {City} sCity - The departure city
 * @property {City} eCity - The arrival city
 * @property {FlightCompany} [company] - The airline
 * @property {Date} [sDate] - The departure date
 * @property {Date} [eDate] - The arrival date
 * @property {number} [distanceInKm] - The authored distance in kilometers
 * @property {number} [durationMinutes] - The authored duration in minutes
 * @property {string} [number] - The flight number
 * @property {string} [class] - The cabin class
 */
interface FlightInterface {
  sCity: City;
  eCity: City;
  company?: FlightCompany;
  sDate?: Date;
  eDate?: Date;
  distanceInKm?: number;
  durationMinutes?: number;
  number?: string;
  class?: string;
}

/**
 * The flight class is used to represent a flight.
 * @class
 * @param {FlightInterface} flightData - The data of the flight
 * @param {City} flightData.sCity - The start city of the flight
 * @param {City} flightData.eCity - The end city of the flight
 * @param {FlightCompany} [flightData.company] - The company of the flight
 * @param {Date} [flightData.sDate] - The start date of the flight
 * @param {Date} [flightData.eDate] - The end date of the flight
 * @param {number} [flightData.distanceInKm] - The distance of the flight in kilometers
 * @param {number} [flightData.durationMinutes] - The flight duration in minutes
 * @param {string} [flightData.number] - The flight number
 * @param {string} [flightData.class] - The travel class
 */
export class Flight implements FlightInterface {
  sCity: City;
  eCity: City;
  travelType: TravelType;
  distanceInKm: number = 0;
  company?: FlightCompany;
  sDate?: Date;
  eDate?: Date;
  durationMinutes: number;
  number?: string;
  class?: string;

  /**
   * Creates a flight and derives its travel type, distance, and duration.
   * @param {FlightInterface} flightData - The flight data
   */
  constructor(flightData: FlightInterface) {
    const {
      sCity,
      eCity,
      company,
      sDate,
      eDate,
      distanceInKm,
      durationMinutes,
      number,
      class: flightClass,
    } = flightData;

    this.sCity = sCity;
    this.eCity = eCity;
    this.travelType = getTravelTypeByStartAndEndCity(sCity, eCity);
    this.distanceInKm = distanceInKm ?? getCitiesDistance(sCity, eCity);
    this.company = company;
    this.sDate = sDate;
    this.eDate = eDate;
    this.durationMinutes =
      durationMinutes ?? Math.round((this.distanceInKm / 900) * 60);
    this.number = number;
    this.class = flightClass;
  }
}
import { FlightCompany } from "../typings/FlightCompany";
