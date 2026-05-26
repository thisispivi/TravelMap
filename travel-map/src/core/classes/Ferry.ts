import { getCitiesDistance } from "@/utils/distance";

import { FerryCompany } from "../typings/FerryCompany";
import { City } from "./City";

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
 * Ferry class
 *
 * The ferry class is used to represent a ferry trip.
 *
 * @class
 *
 * @param {FerryInterface} ferryData - The data of the ferry trip
 * @param {City} ferryData.sCity - The start city of the ferry trip
 * @param {City} ferryData.eCity - The end city of the ferry trip
 * @param {FerryCompany} ferryData.company - The company of the ferry trip
 * @param {number} ferryData.distanceInKm - The distance of the ferry trip in kilometers
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

  constructor({
    sCity,
    eCity,
    company,
    sDate,
    eDate,
    via = [],
    distanceInKm,
    durationMinutes,
  }: FerryInterface) {
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
