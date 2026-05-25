import "./RowCurrency.scss";

import { JSX } from "react";

import { Currency } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { CurrencyFlag } from "../../atoms";
import { Row } from "./Row";

interface CurrencyRowProps {
  className?: string;
  currency?: Currency;
}

/**
 * CurrencyRow component
 *
 * Displays a currency flag, localized name, and symbol.
 *
 * @component
 *
 * @param {CurrencyRowProps} props - The currency row props
 * @param {Currency} [props.currency] - Currency to display
 * @param {string} [props.className] - Additional class names
 * @returns {JSX.Element} The currency row
 */
export function CurrencyRow({
  currency,
  className = "",
}: CurrencyRowProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  return (
    <Row className={`currency-row ${className}`}>
      <CurrencyFlag className="currency-row__flag" currency={currency} />
      <p className="currency-row__name">{t(`currency.${currency}.name`)}</p>
      <b className="currency-row__symbol">{t(`currency.${currency}.symbol`)}</b>
    </Row>
  );
}
