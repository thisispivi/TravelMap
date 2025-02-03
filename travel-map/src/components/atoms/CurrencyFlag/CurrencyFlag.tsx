import {
  HungaryFlag,
  UnitedKingdomFlag,
  JapanFlag,
  EuropeFlag,
} from "../../../assets";
import { JSX } from "react";
import { Currency } from "../../../core";

interface CurrencyFlagProps {
  currency?: Currency;
  className?: string;
}

/**
 * CurrencyFlag component
 *
 * Given a currency name, it returns the flag of the currency
 *
 * @component
 *
 * @param {CurrencyFlagProps} props - The props of the component
 * @param {Currency} props.currency - The currency
 * @param {string} [props.className=""] - The class name of the component
 * @returns {JSX.Element|null} The currency flag
 */
export default function CurrencyFlag({
  currency,
  className = "",
}: CurrencyFlagProps): JSX.Element | null {
  switch (currency) {
    case Currency.EUR:
      return <EuropeFlag className={className} />;
    case Currency.GBP:
      return <UnitedKingdomFlag className={className} />;
    case Currency.HUF:
      return <HungaryFlag className={className} />;
    case Currency.JPY:
      return <JapanFlag className={className} />;
    default:
      return null;
  }
}
