import { Country, Currency } from "@travelmap/core";
import type { i18n } from "i18next";
import { uniqueBy } from "remeda";

/**
 * Localized currency information associated with a representative country.
 * @property {Currency} code - ISO 4217 currency code
 * @property {string} countryId - Country identifier used to resolve its flag
 * @property {string} name - Localized currency name
 * @property {string} symbol - Localized narrow currency symbol
 */
export interface CurrencyDisplay {
  code: Currency;
  countryId: string;
  name: string;
  symbol: string;
}

/**
 * Returns one visited country for each distinct currency, preserving input order.
 * @param {Country[]} countries - Visited countries
 * @returns {Country[]} Representative countries with unique currencies
 */
export function getCurrencyCountries(countries: Country[]): Country[] {
  return uniqueBy(countries, (country) => country.currency);
}

/**
 * Resolves the localized name, symbol, and flag country for a currency.
 * @param {Country} country - Representative visited country
 * @param {i18n["t"]} t - Active i18n translation function
 * @returns {CurrencyDisplay} Localized currency presentation data
 */
export function getCurrencyDisplay(
  country: Country,
  t: i18n["t"],
): CurrencyDisplay {
  return {
    code: country.currency,
    countryId: country.id,
    name: t(`currency.${country.currency}.name`, {
      defaultValue: country.currency,
    }),
    symbol: t(`currency.${country.currency}.symbol`, {
      defaultValue: country.currency,
    }),
  };
}
