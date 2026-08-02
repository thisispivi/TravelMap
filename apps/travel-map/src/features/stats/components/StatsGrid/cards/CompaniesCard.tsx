import "./CompaniesCard.scss";

import { ReactNode } from "react";

import { siteConfig } from "@/data/world";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { CompanyStat } from "../../../lib/transport";
import { Card } from "../../Card/Card";

/**
 * Props for the CompaniesCard component.
 * @property {CompanyStat<string>[]} flightCompanyStats - Flight companies ranked by trip count.
 * @property {CompanyStat<string>[]} ferryCompanyStats - Ferry companies ranked by crossing count.
 */
export type CompaniesCardProps = {
  flightCompanyStats: CompanyStat<string>[];
  ferryCompanyStats: CompanyStat<string>[];
};

/**
 * CompaniesCard component
 * Bento half-width card listing flight and ferry companies used, each with
 * their logo and trip count, sorted by frequency.
 * @component
 * @param {CompaniesCardProps} props
 * @param {CompanyStat<string>[]} props.flightCompanyStats - Flight companies ranked by journey count
 * @param {CompanyStat<string>[]} props.ferryCompanyStats - Ferry companies ranked by crossing count
 * @returns {ReactNode} The companies bento card
 */
export function CompaniesCard({
  flightCompanyStats,
  ferryCompanyStats,
}: CompaniesCardProps): ReactNode {
  const { t } = useLanguage(["home"]);
  return (
    <Card className="bento-card bento-card--half bento-detail card--box-shadow">
      <div className="bento-detail__top">
        <h2>{t("stats.flightCompanies")}</h2>
      </div>
      <div className="bento-detail__rows">
        {flightCompanyStats.map(({ company, count }) => {
          const metadata = siteConfig?.companies?.[company];
          return (
            <div className="bento-detail__row bento-company-row" key={company}>
              {metadata?.logo ? (
                <img
                  alt=""
                  aria-hidden="true"
                  className="bento-company-row__logo"
                  src={metadata.logo}
                />
              ) : null}
              <p className="bento-company-row__name">
                {metadata?.name ?? company}
              </p>
              <b className="bento-company-row__count">{count}</b>
            </div>
          );
        })}
      </div>
      <div className="bento-detail__top bento-companies__section-header">
        <h2>{t("stats.ferryCompanies")}</h2>
      </div>
      <div className="bento-detail__rows">
        {ferryCompanyStats.map(({ company, count }) => {
          const metadata = siteConfig?.companies?.[company];
          return (
            <div className="bento-detail__row bento-company-row" key={company}>
              {metadata?.logo ? (
                <img
                  alt=""
                  aria-hidden="true"
                  className="bento-company-row__logo"
                  src={metadata.logo}
                />
              ) : null}
              <p className="bento-company-row__name">
                {metadata?.name ?? company}
              </p>
              <b className="bento-company-row__count">{count}</b>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
