import "./CompaniesCard.scss";

import { ReactNode } from "react";

import { resolveLogoUrl } from "@/data/logos";
import { siteConfig } from "@/data/world";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { CompanyStat } from "../../lib/transport";

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
 * @returns {ReactNode} The companies panel
 */
export function CompaniesCard({
  flightCompanyStats,
  ferryCompanyStats,
}: CompaniesCardProps): ReactNode {
  const { t } = useLanguage(["home"]);
  return (
    <section className="stats-panel stats-panel--half stats-block">
      <div className="stats-block__top">
        <h2>{t("stats.flightCompanies")}</h2>
      </div>
      <div className="stats-block__rows">
        {flightCompanyStats.map(({ company, count }) => {
          const metadata = siteConfig?.companies?.[company];
          const logo = resolveLogoUrl(metadata?.logo);
          return (
            <div className="stats-block__row stats-company-row" key={company}>
              {logo ? (
                <img
                  alt=""
                  aria-hidden="true"
                  className="stats-company-row__logo"
                  src={logo}
                />
              ) : null}
              <p className="stats-company-row__name">
                {metadata?.name ?? company}
              </p>
              <b className="stats-company-row__count">{count}</b>
            </div>
          );
        })}
      </div>
      <div className="stats-block__top stats-companies__section-header">
        <h2>{t("stats.ferryCompanies")}</h2>
      </div>
      <div className="stats-block__rows">
        {ferryCompanyStats.map(({ company, count }) => {
          const metadata = siteConfig?.companies?.[company];
          const logo = resolveLogoUrl(metadata?.logo);
          return (
            <div className="stats-block__row stats-company-row" key={company}>
              {logo ? (
                <img
                  alt=""
                  aria-hidden="true"
                  className="stats-company-row__logo"
                  src={logo}
                />
              ) : null}
              <p className="stats-company-row__name">
                {metadata?.name ?? company}
              </p>
              <b className="stats-company-row__count">{count}</b>
            </div>
          );
        })}
      </div>
    </section>
  );
}
