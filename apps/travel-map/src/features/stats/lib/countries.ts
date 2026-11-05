import { Country, Currency } from "@travelmap/core";
import { uniqueBy } from "remeda";

import { currencyName, currencySymbol } from "@/shared/lib/currency";

/**
 * Localized currency information associated with a representative country.
 * @property {Currency} code - ISO 4217 currency code
 * @property {string} countryId - Flag identifier, a country code or `EU` for the euro
 * @property {string} name - Localized currency name
 * @property {string} symbol - Localized narrow currency symbol
 */
export interface CurrencyDisplay {
  code: Currency;
  countryId: string;
  name: string;
  symbol: string;
}

/* The euro is issued supranationally, so a member state's flag misrepresents it. */
const CURRENCY_FLAG_IDS: Partial<Record<Currency, string>> = {
  [Currency.EUR]: "EU",
};

/** A country that issues a currency, which Antarctica and a few territories do not. */
type CurrencyCountry = Country & { currency: Currency };

/**
 * Returns one visited country for each distinct currency, preserving input order.
 * @param {Country[]} countries - Visited countries
 * @returns {CurrencyCountry[]} Representative countries with unique currencies
 */
export function getCurrencyCountries(countries: Country[]): CurrencyCountry[] {
  return uniqueBy(
    countries.filter(
      (country): country is CurrencyCountry => country.currency !== undefined,
    ),
    (country) => country.currency,
  );
}

/**
 * Resolves the localized name, symbol, and flag country for a currency.
 * @param {CurrencyCountry} country - Representative visited country
 * @param {string} locale - The reader's locale
 * @returns {CurrencyDisplay} Localized currency presentation data
 */
export function getCurrencyDisplay(
  country: CurrencyCountry,
  locale: string,
): CurrencyDisplay {
  return {
    code: country.currency,
    countryId: CURRENCY_FLAG_IDS[country.currency] ?? country.id,
    name: currencyName(country.currency, locale),
    symbol: currencySymbol(country.currency, locale),
  };
}
