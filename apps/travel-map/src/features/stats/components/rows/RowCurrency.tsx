import "./RowCurrency.scss";

import { Country } from "@travelmap/core";
import { ReactNode } from "react";

import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { Row } from "@/shared/components/Row/Row";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { getCurrencyDisplay } from "../../lib/countries";

/**
 * Properties accepted by the CurrencyRow component.
 * @property {string} [className] - Additional class names
 * @property {Country} country - Representative country for the currency
 */
interface CurrencyRowProps {
  className?: string;
  country: Country;
}

/**
 * CurrencyRow component
 * Displays a visited country's flag with its localized currency name and symbol.
 * @param {CurrencyRowProps} props - The currency row props
 * @param {Country} props.country - Representative country and currency to display
 * @param {string} [props.className=""] - Additional class names
 * @returns {ReactNode} The currency row
 */
export function CurrencyRow({
  country,
  className = "",
}: CurrencyRowProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const currency = getCurrencyDisplay(country, t);

  return (
    <Row className={`currency-row ${className}`}>
      <CountryFlag
        className="currency-row__flag"
        countryId={currency.countryId}
      />
      <p className="currency-row__name">{currency.name}</p>
      <b className="currency-row__symbol">{currency.symbol}</b>
    </Row>
  );
}
