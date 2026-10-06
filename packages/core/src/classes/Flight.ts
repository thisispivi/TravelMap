import { CompanyId } from "../schema";
import { getTravelTypeByStartAndEndCity, TravelType } from "../typings/Travel";
import { City } from "./City";

/**
 * Data used to construct a flight.
 * @property {City} sCity - The departure city
 * @property {City} eCity - The arrival city
 * @property {CompanyId} [company] - The airline
 * @property {Date} [sDate] - The departure date
 * @property {Date} [eDate] - The arrival date
 * @property {number} distanceInKm - The resolved distance in kilometers
 * @property {number} durationMinutes - The resolved duration in minutes
 * @property {string} [number] - The flight number
 * @property {string} [class] - The cabin class
 */
interface FlightInterface {
  sCity: City;
  eCity: City;
  company?: CompanyId;
  sDate?: Date;
  eDate?: Date;
  distanceInKm: number;
  durationMinutes: number;
  number?: string;
  class?: string;
}

/**
 * The flight class is used to represent a flight.
 * @class
 * @param {FlightInterface} flightData - The data of the flight
 * @param {City} flightData.sCity - The start city of the flight
 * @param {City} flightData.eCity - The end city of the flight
 * @param {CompanyId} [flightData.company] - The company of the flight
 * @param {Date} [flightData.sDate] - The start date of the flight
 * @param {Date} [flightData.eDate] - The end date of the flight
 * @param {number} flightData.distanceInKm - The distance of the flight in kilometers
 * @param {number} flightData.durationMinutes - The flight duration in minutes
 * @param {string} [flightData.number] - The flight number
 * @param {string} [flightData.class] - The travel class
 */
export class Flight implements FlightInterface {
  sCity: City;
  eCity: City;
  travelType: TravelType;
  distanceInKm: number;
  company?: CompanyId;
  sDate?: Date;
  eDate?: Date;
  durationMinutes: number;
  number?: string;
  class?: string;

  /**
   * Creates a flight and derives its travel type. Distance and duration arrive
   * already resolved by `resolveLegDistance`/`resolveLegDuration`.
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
    this.distanceInKm = distanceInKm;
    this.company = company;
    this.sDate = sDate;
    this.eDate = eDate;
    this.durationMinutes = durationMinutes;
    this.number = number;
    this.class = flightClass;
  }
}
