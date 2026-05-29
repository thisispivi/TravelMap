import "./CompaniesCard.scss";

import { ComponentType, JSX, SVGProps } from "react";

import {
  AeroitaliaLogo,
  AnaLogo,
  ChinaEasternLogo,
  CorsicaFerriesLogo,
  EasyJetLogo,
  ItaAirwaysLogo,
  JetstarLogo,
  RyanairLogo,
  TirreniaLogo,
  VirginAustraliaLogo,
  WizzAirLogo,
} from "@/assets";
import { FerryCompany, FlightCompany } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { CompanyStat } from "@/utils/transport";

import { Card } from "../../../molecules/Cards/Card";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

const flightCompanyLogos: Partial<Record<FlightCompany, SvgIcon>> = {
  [FlightCompany.RYANAIR]: RyanairLogo,
  [FlightCompany.EASYJET]: EasyJetLogo,
  [FlightCompany.WIZZ_AIR]: WizzAirLogo,
  [FlightCompany.ITA_AIRWAYS]: ItaAirwaysLogo,
  [FlightCompany.ALL_NIPPON_AIRWAYS]: AnaLogo,
  [FlightCompany.CHINA_EASTERN_AIRLINES]: ChinaEasternLogo,
  [FlightCompany.JETSTAR]: JetstarLogo,
  [FlightCompany.VIRGIN_AUSTRALIA]: VirginAustraliaLogo,
  [FlightCompany.AEROITALIA]: AeroitaliaLogo,
};

const ferryCompanyLogos: Partial<Record<FerryCompany, SvgIcon>> = {
  [FerryCompany.CORSICA_FERRIES]: CorsicaFerriesLogo,
  [FerryCompany.TIRRENIA]: TirreniaLogo,
};

/**
 * Props for the CompaniesCard component.
 *
 * @property {CompanyStat<FlightCompany>[]} flightCompanyStats - Flight companies ranked by trip count.
 * @property {CompanyStat<FerryCompany>[]} ferryCompanyStats - Ferry companies ranked by crossing count.
 */
export type CompaniesCardProps = {
  flightCompanyStats: CompanyStat<FlightCompany>[];
  ferryCompanyStats: CompanyStat<FerryCompany>[];
};

/**
 * CompaniesCard component
 *
 * Bento half-width card listing flight and ferry companies used, each with
 * their logo and trip count, sorted by frequency.
 *
 * @component
 *
 * @param {CompaniesCardProps} props
 * @returns {JSX.Element} The companies bento card
 */
export function CompaniesCard({
  flightCompanyStats,
  ferryCompanyStats,
}: CompaniesCardProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  return (
    <Card className="bento-card bento-card--half bento-detail card--box-shadow">
      <div className="bento-detail__top">
        <h2>{t("stats.flightCompanies")}</h2>
      </div>
      <div className="bento-detail__rows">
        {flightCompanyStats.map(({ company, count }) => {
          const Logo = flightCompanyLogos[company];
          return (
            <div className="bento-detail__row bento-company-row" key={company}>
              {Logo ? <Logo className="bento-company-row__logo" /> : null}
              <p className="bento-company-row__name">
                {t(`flightCompany.${company}`)}
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
          const Logo = ferryCompanyLogos[company];
          return (
            <div className="bento-detail__row bento-company-row" key={company}>
              {Logo ? <Logo className="bento-company-row__logo" /> : null}
              <p className="bento-company-row__name">
                {t(`ferryCompany.${company}`)}
              </p>
              <b className="bento-company-row__count">{count}</b>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
