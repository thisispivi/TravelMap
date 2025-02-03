import { unique } from "remeda";
import { Country, Currency } from "../core";

/**
 * Get all currencies from a list of countries.
 * @param {Country[]} countries - List of countries.
 * @returns {Currency[]} - List of currencies.
 */
export function getCurrenciesFromCountries(countries: Country[]): Currency[] {
  return unique(countries.map((country) => country.currency));
}
