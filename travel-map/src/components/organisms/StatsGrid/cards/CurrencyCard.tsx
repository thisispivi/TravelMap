import "./CurrencyCard.scss";

import { JSX } from "react";

import { Currency } from "@/core";
import { useLanguage } from "@/hooks/language/language";

import { Card } from "../../../molecules/Cards/Card";
import { CurrencyRow } from "../../../molecules/Row/RowCurrency";

/**
 * Props for the CurrencyCard component.
 *
 * @property {Currency[]} currencies - Currencies used across all visited countries.
 */
export type CurrencyCardProps = {
  currencies: Currency[];
};

/**
 * CurrencyCard component
 *
 * Bento half-width card displaying all currencies encountered while traveling
 * as pill badges with flag, name, and symbol.
 *
 * @component
 *
 * @param {CurrencyCardProps} props
 * @returns {JSX.Element} The currency bento card
 */
export function CurrencyCard({ currencies }: CurrencyCardProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  return (
    <Card className="bento-card bento-card--half bento-detail card--box-shadow">
      <div className="bento-detail__top">
        <h2>{t("stats.currency")}</h2>
      </div>
      <div className="bento-currency">
        {currencies.map((currency) => (
          <CurrencyRow currency={currency} key={currency} />
        ))}
      </div>
    </Card>
  );
}
