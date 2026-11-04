import { Currency, CURRENCY_SYMBOLS } from "@travelmap/core";

/**
 * Names a currency in the reader's language, such as `Euro` or `Yen giapponese`.
 * The platform's own CLDR data covers every currency and locale, so there is no
 * table of translations to keep up.
 * @param {Currency} code - The currency
 * @param {string} locale - The reader's locale
 * @returns {string} Its name, capitalised as a label
 */
export function currencyName(code: Currency, locale: string): string {
  const name =
    new Intl.DisplayNames([locale], { type: "currency" }).of(code) ?? code;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

/**
 * Finds the sign a currency is written with, such as `€` or `kr`: the reader's
 * own when their language has one, otherwise the one used where it is spent.
 * @param {Currency} code - The currency
 * @param {string} locale - The reader's locale
 * @returns {string} The sign
 */
export function currencySymbol(code: Currency, locale: string): string {
  const symbol = new Intl.NumberFormat(locale, {
    currency: code,
    currencyDisplay: "narrowSymbol",
    style: "currency",
  })
    .formatToParts(0)
    .find(({ type }) => type === "currency")?.value;
  return symbol && symbol !== code ? symbol : CURRENCY_SYMBOLS[code];
}
