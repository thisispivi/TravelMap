import { City } from "../classes/City";

export enum TravelType {
  NATIONAL = "national",
  INTERNATIONAL = "international",
  INTERCONTINENTAL = "intercontinental",
}

/**
 * Return the travel type given the start and end city
 * @param {City} flightData.sCity - The start city of the flight
 * @param {City} flightData.eCity - The end city of the flight
 * @returns {TravelType} The travel type
 */
export function getTravelTypeByStartAndEndCity(
  sCity: City,
  eCity: City
): TravelType {
  const isIntercontinental =
    sCity.country.continent !== eCity.country.continent;

  if (sCity.country === eCity.country) return TravelType.NATIONAL;
  if (sCity.country !== eCity.country && !isIntercontinental)
    return TravelType.INTERNATIONAL;
  return TravelType.INTERCONTINENTAL;
}
