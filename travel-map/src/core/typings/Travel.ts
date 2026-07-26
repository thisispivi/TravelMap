import { City } from "../classes/City";

/**
 * Flight distance category relative to country and continent boundaries.
 * @property {string} NATIONAL - The national travel category
 * @property {string} INTERNATIONAL - The international travel category
 * @property {string} INTERCONTINENTAL - The intercontinental travel category
 */
export enum TravelType {
  NATIONAL = "national",
  INTERNATIONAL = "international",
  INTERCONTINENTAL = "intercontinental",
}

/**
 * Return the travel type given the start and end city
 * @param {City} sCity - The start city of the travel
 * @param {City} eCity - The end city of the travel
 * @returns {TravelType} The travel type
 */
export function getTravelTypeByStartAndEndCity(
  sCity: City,
  eCity: City,
): TravelType {
  const isIntercontinental =
    sCity.country.continent !== eCity.country.continent;

  if (sCity.country === eCity.country) return TravelType.NATIONAL;
  if (sCity.country !== eCity.country && !isIntercontinental)
    return TravelType.INTERNATIONAL;
  return TravelType.INTERCONTINENTAL;
}
