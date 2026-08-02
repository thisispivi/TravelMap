import "./CurrencyCard.scss";

import { Currency } from "@travelmap/core";
import { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { Card } from "../../Card/Card";
import { CurrencyRow } from "../../rows/RowCurrency";

/**
 * Props for the CurrencyCard component.
 * @property {Currency[]} currencies - Currencies used across all visited countries.
 */
export type CurrencyCardProps = {
  currencies: Currency[];
};

/**
 * CurrencyCard component
 * Bento half-width card displaying all currencies encountered while traveling
 * as pill badges with flag, name, and symbol.
 * @component
 * @param {CurrencyCardProps} props
 * @param {Currency[]} props.currencies - Currencies encountered while traveling
 * @returns {ReactNode} The currency bento card
 */
export function CurrencyCard({ currencies }: CurrencyCardProps): ReactNode {
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
