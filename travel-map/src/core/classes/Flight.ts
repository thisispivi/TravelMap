import { getCitiesDistance } from "../../utils/distance";
import { FlightCompany } from "../typings/FlightCompany";
import { getTravelTypeByStartAndEndCity, TravelType } from "../typings/Travel";
import { City } from "./City";

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
  company?: FlightCompany;
  sDate?: Date;
  eDate?: Date;
  durationMinutes: number;
  number?: string;
  class?: string;

  constructor({
    sCity,
    eCity,
    company,
    sDate,
    eDate,
    distanceInKm,
    durationMinutes,
    number,
    class: flightClass,
  }: FlightInterface) {
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
