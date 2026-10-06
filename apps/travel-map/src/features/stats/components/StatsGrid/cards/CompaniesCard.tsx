import "./CompaniesCard.scss";

import { ReactNode } from "react";

import { resolveCompany } from "@/data/companies";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { CompanyStat } from "../../../lib/transport";
import { Card } from "../../Card/Card";

/**
 * Props for the CompanyRows component.
 * @property {CompanyStat[]} stats - Operators ranked by journey count
 */
interface CompanyRowsProps {
  stats: CompanyStat[];
}

/**
 * CompanyRows component
 * Renders one ranked list of operators with their logo, name, and count.
 * @component
 * @param {CompanyRowsProps} props
 * @param {CompanyStat[]} props.stats - Operators ranked by journey count
 * @returns {ReactNode} The operator rows
 */
function CompanyRows({ stats }: CompanyRowsProps): ReactNode {
  return (
    <div className="bento-detail__rows">
      {stats.map(({ company, count }) => {
        const { logo, name } = resolveCompany(company);
        return (
          <div className="bento-detail__row bento-company-row" key={company}>
            {logo ? (
              <img
                alt=""
                aria-hidden="true"
                className="bento-company-row__logo"
                src={logo}
              />
            ) : null}
            <p className="bento-company-row__name">{name}</p>
            <b className="bento-company-row__count">{count}</b>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Props for the CompaniesCard component.
 * @property {CompanyStat[]} flightCompanyStats - Flight companies ranked by trip count
 * @property {CompanyStat[]} ferryCompanyStats - Ferry companies ranked by crossing count
 */
export interface CompaniesCardProps {
  flightCompanyStats: CompanyStat[];
  ferryCompanyStats: CompanyStat[];
}

/**
 * CompaniesCard component
 * Bento half-width card listing flight and ferry companies used, each with
 * their logo and trip count, sorted by frequency.
 * @component
 * @param {CompaniesCardProps} props
 * @param {CompanyStat[]} props.flightCompanyStats - Flight companies ranked by journey count
 * @param {CompanyStat[]} props.ferryCompanyStats - Ferry companies ranked by crossing count
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
      <CompanyRows stats={flightCompanyStats} />
      <div className="bento-detail__top bento-companies__section-header">
        <h2>{t("stats.ferryCompanies")}</h2>
      </div>
      <CompanyRows stats={ferryCompanyStats} />
    </Card>
  );
}
