import "./CurrencyCard.scss";

import { Country } from "@travelmap/core";
import { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { Card } from "../../Card/Card";
import { CurrencyRow } from "../../rows/RowCurrency";

/**
 * Props for the CurrencyCard component.
 * @property {Country[]} countries - Representative visited countries for each currency.
 */
export type CurrencyCardProps = {
  countries: Country[];
};

/**
 * CurrencyCard component
 * Bento half-width card displaying all currencies encountered while traveling
 * as pill badges with flag, name, and symbol.
 * @component
 * @param {CurrencyCardProps} props
 * @param {Country[]} props.countries - Representative countries for currencies encountered while traveling
 * @returns {ReactNode} The currency bento card
 */
export function CurrencyCard({ countries }: CurrencyCardProps): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <Card className="bento-card bento-card--half bento-detail card--box-shadow">
      <div className="bento-detail__top">
        <h2>{t("stats.currency")}</h2>
      </div>
      <div className="bento-currency">
        {countries.map((country) => (
          <CurrencyRow country={country} key={country.currency} />
        ))}
      </div>
    </Card>
  );
}
