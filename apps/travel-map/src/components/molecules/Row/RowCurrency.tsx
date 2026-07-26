import "./RowCurrency.scss";

import { Currency } from "@travelmap/core";
import { ReactNode } from "react";

import { useLanguage } from "../../../hooks/language/language";
import { Row } from "./Row";

/**
 * Resolves a currency's localized display name through the browser's CLDR data.
 * @param {string} currency - ISO 4217 currency code
 * @param {string} locale - Active UI locale
 * @returns {string} Localized currency name with the code as fallback
 */
function getCurrencyName(currency: string, locale: string): string {
  return (
    new Intl.DisplayNames([locale], { type: "currency" }).of(currency) ??
    currency
  );
}

/**
 * Resolves a compact localized currency symbol without rendering a country flag.
 * @param {string} currency - ISO 4217 currency code
 * @param {string} locale - Active UI locale
 * @returns {string} Currency symbol or code
 */
function getCurrencySymbol(currency: string, locale: string): string {
  return (
    new Intl.NumberFormat(locale, {
      currency,
      currencyDisplay: "narrowSymbol",
      style: "currency",
    })
      .formatToParts(0)
      .find(({ type }) => type === "currency")?.value ?? currency
  );
}

/**
 * Properties accepted by the CurrencyRow component.
 * @property {string} [className] - The class name
 * @property {Currency} [currency] - The currency
 */
interface CurrencyRowProps {
  className?: string;
  currency?: Currency;
}

/**
 * CurrencyRow component
 * Displays a localized currency name and symbol from browser locale data.
 * @component
 * @param {CurrencyRowProps} props - The currency row props
 * @param {Currency} [props.currency] - Currency to display
 * @param {string} [props.className=""] - Additional class names
 * @returns {ReactNode} The currency row
 */
export function CurrencyRow({
  currency,
  className = "",
}: CurrencyRowProps): ReactNode {
  const { currLanguage } = useLanguage(["home"]);
  if (!currency) return null;
  return (
    <Row className={`currency-row ${className}`}>
      <p className="currency-row__name">
        {getCurrencyName(currency, currLanguage)}
      </p>
      <b className="currency-row__symbol">
        {getCurrencySymbol(currency, currLanguage)}
      </b>
    </Row>
  );
}
