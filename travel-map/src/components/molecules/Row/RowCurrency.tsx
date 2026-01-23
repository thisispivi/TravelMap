import "./RowCurrency.scss";
import { Currency } from "../../../core";
import { CurrencyFlag } from "../../atoms";
import { JSX } from "react";
import { Row } from "..";
import { useLanguage } from "../../../hooks/language/language";

interface CurrencyRowProps {
  className?: string;
  currency?: Currency;
}

/**
 * A currency row
 *
 * The currency row component is used to create a currency row.
 *
 * @component
 *
 * @param {CurrencyRowProps} props - The props of the component
 * @param {string} props.className - The class to apply to the currency row
 * @returns {JSX.Element} - The currency row
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
