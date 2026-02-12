import { getCitiesDistance } from "@/utils/distance";

import { FerryCompany } from "../typings/FerryCompany";
import { City } from "./City";

export interface FerryInterface {
  sCity: City;
  eCity: City;
  company: FerryCompany;
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
  company: FerryCompany;
  distanceInKm: number;

  constructor({ sCity, eCity, company }: FerryInterface) {
    this.sCity = sCity;
    this.eCity = eCity;
    this.company = company;
    this.distanceInKm = getCitiesDistance(sCity, eCity);
  }
}
