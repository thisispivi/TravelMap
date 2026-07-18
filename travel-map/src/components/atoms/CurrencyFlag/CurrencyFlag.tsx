import { ReactNode } from "react";

import AustraliaFlag from "@/assets/icons/flags/Australia.svg?react";
import BulgariaFlag from "@/assets/icons/flags/Bulgaria.svg?react";
import EuropeFlag from "@/assets/icons/flags/Europe.svg?react";
import HungaryFlag from "@/assets/icons/flags/Hungary.svg?react";
import JapanFlag from "@/assets/icons/flags/Japan.svg?react";
import RomaniaFlag from "@/assets/icons/flags/Romania.svg?react";
import SwedenFlag from "@/assets/icons/flags/Sweden.svg?react";
import UnitedKingdomFlag from "@/assets/icons/flags/UnitedKingdom.svg?react";

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
 * @returns {ReactNode} The currency flag
 */
export function CurrencyFlag({
  currency,
  className = "",
}: CurrencyFlagProps): ReactNode {
  switch (currency) {
    case Currency.EUR:
      return <EuropeFlag className={className} />;
    case Currency.GBP:
      return <UnitedKingdomFlag className={className} />;
    case Currency.HUF:
      return <HungaryFlag className={className} />;
    case Currency.JPY:
      return <JapanFlag className={className} />;
    case Currency.AUD:
      return <AustraliaFlag className={className} />;
    case Currency.BGN:
      return <BulgariaFlag className={className} />;
    case Currency.RON:
      return <RomaniaFlag className={className} />;
    case Currency.SEK:
      return <SwedenFlag className={className} />;
    default:
      return null;
  }
}
