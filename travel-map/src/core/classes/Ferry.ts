import { getCitiesDistance } from "@/utils/distance";

import { FerryCompany } from "../typings/FerryCompany";
import { City } from "./City";

/**
 * Data used to construct a ferry journey.
 * @property {City} sCity - The departure city
 * @property {City} eCity - The arrival city
 * @property {FerryCompany} [company] - The ferry operator
 * @property {Date} [sDate] - The departure date
 * @property {Date} [eDate] - The arrival date
 * @property {City[]} [via] - Intermediate ports
 * @property {number} [distanceInKm] - The authored distance in kilometers
 * @property {number} [durationMinutes] - The authored duration in minutes
 */
interface FerryInterface {
  sCity: City;
  eCity: City;
  company?: FerryCompany;
  sDate?: Date;
  eDate?: Date;
  via?: City[];
  distanceInKm?: number;
  durationMinutes?: number;
}

/**
 * The ferry class is used to represent a ferry trip.
 * @class
 * @param {FerryInterface} ferryData - The data of the ferry trip
 * @param {City} ferryData.sCity - The start city of the ferry trip
 * @param {City} ferryData.eCity - The end city of the ferry trip
 * @param {FerryCompany} [ferryData.company] - The company of the ferry trip
 * @param {Date} [ferryData.sDate] - The start date of the ferry trip
 * @param {Date} [ferryData.eDate] - The end date of the ferry trip
 * @param {City[]} [ferryData.via] - Intermediate cities on the ferry route
 * @param {number} [ferryData.distanceInKm] - The distance of the ferry trip in kilometers
 * @param {number} [ferryData.durationMinutes] - The ferry duration in minutes
 */
export class Ferry implements FerryInterface {
  sCity: City;
  eCity: City;
  company?: FerryCompany;
  sDate?: Date;
  eDate?: Date;
  via: City[];
  distanceInKm: number;
  durationMinutes: number;

  /**
   * Creates a ferry journey and derives missing distance or duration values.
   * @param {FerryInterface} ferryData - The ferry journey data
   */
  constructor(ferryData: FerryInterface) {
    const {
      sCity,
      eCity,
      company,
      sDate,
      eDate,
      via = [],
      distanceInKm,
      durationMinutes,
    } = ferryData;

    this.sCity = sCity;
    this.eCity = eCity;
    this.company = company;
    this.sDate = sDate;
    this.eDate = eDate;
    this.via = via;
    this.distanceInKm =
      distanceInKm ??
      [sCity, ...via, eCity]
        .slice(0, -1)
        .reduce(
          (sum, city, index, cities) =>
            sum + getCitiesDistance(city, cities[index + 1] ?? eCity),
          0,
        );
    this.durationMinutes =
      durationMinutes ?? Math.round((this.distanceInKm / 45) * 60);
  }
}
