import "./FiguresPage.scss";

import { getCitiesBearing, getCitiesDistance } from "@travelmap/core";
import { ReactNode } from "react";

import {
  takenFerries,
  takenFlights,
  visitedCities,
  visitedTrips,
} from "@/data/world";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { resolveOrigin } from "@/shared/lib/bearings";
import { constants } from "@/shared/lib/parameters";

import { getCardinalBounds } from "../../lib/bounds";
import { useStatsData } from "../../lib/useStatsData";
import { BoundsCross } from "../BoundsCross/BoundsCross";
import { CitiesPerCountryCard } from "../cards/CitiesPerCountryCard";
import { CompaniesCard } from "../cards/CompaniesCard";
import { ContinentsChartCard } from "../cards/ContinentsChartCard";
import { CoverageCard } from "../cards/CoverageCard";
import { CurrencyCard } from "../cards/CurrencyCard";
import { DaysPerYearCard } from "../cards/DaysPerYearCard";
import { PopulationCard } from "../cards/PopulationCard";
import { TransportCard } from "../cards/TransportCard";
import { TransportModesCard } from "../cards/TransportModesCard";
import { Reach, ReachEdge } from "../Reach/Reach";
import { StatFigure } from "../StatFigure/StatFigure";

/**
 * FiguresPage component
 * Everything the record adds up to. It opens with the single distance the whole
 * archive amounts to and the outline of where that distance reached, then works
 * inward through coverage, transport and time. The widened margin gives the
 * charts room while the plate keeps the map beside them, so a figure and the
 * geography it came from stay in view together.
 * @component
 * @returns {ReactNode} The figures page
 */
export function FiguresPage(): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const stats = useStatsData();
  const origin = resolveOrigin();
  const { TOTAL_CONTINENTS, TOTAL_COUNTRIES, TOTAL_UNESCO_SITES } = constants;
  const hasData = visitedTrips.length > 0 || visitedCities.length > 0;

  if (!hasData) {
    return (
      <div className="figures figures--empty">
        <EmptyState message={t("stats.empty")} />
      </div>
    );
  }

  /**
   * Measures a place from the origin so it can be printed with a reading.
   * @param {typeof stats.furthestCity} city - The place to measure
   * @returns {ReachEdge | null} The measured edge, or null without an origin
   */
  const toEdge = (city: typeof stats.furthestCity): ReachEdge | null =>
    origin && city
      ? {
          city,
          bearing: getCitiesBearing(origin, city),
          distanceKm: getCitiesDistance(origin, city),
        }
      : null;

  return (
    <div className="figures">
      <Reach
        aroundEarth={stats.totalMileageAroundEarth}
        furthest={toEdge(stats.furthestCity)}
        nearest={toEdge(stats.nearestCity)}
        toMoon={stats.totalMileageToMoon}
        totalKm={Number(stats.totalMileage)}
      />

      <section className="stats-section">
        <h2 className="stats-section__label eyebrow">
          {t("figures.bounds.title")}
        </h2>
        <BoundsCross bounds={getCardinalBounds(visitedCities)} />
      </section>

      <section className="stats-section">
        <h2 className="stats-section__label eyebrow">{t("stats.coverage")}</h2>
        <div className="stats-section__figures">
          <StatFigure
            label={t("stats.countries")}
            suffix={`/ ${TOTAL_COUNTRIES}`}
            value={stats.visitedCountriesCount}
          />
          <StatFigure label={t("stats.cities")} value={visitedCities.length} />
          <StatFigure
            label={t("stats.unesco")}
            suffix={`/ ${TOTAL_UNESCO_SITES}`}
            value={stats.numUnescoSites}
          />
          <StatFigure
            label={t("stats.media")}
            value={stats.totalMediaTaken.toLocaleString(lang)}
          />
        </div>
        <div className="stats-section__panels">
          <CoverageCard
            allContinents={stats.allContinents}
            totalContinents={TOTAL_CONTINENTS}
            visitedContinents={stats.visitedContinents}
          />
          <ContinentsChartCard data={stats.continentCities} />
          <CitiesPerCountryCard data={stats.countryVisitStats} />
          <PopulationCard cities={visitedCities} />
          <CurrencyCard countries={stats.currencyCountries} />
        </div>
      </section>

      <section className="stats-section">
        <h2 className="stats-section__label eyebrow">{t("stats.transport")}</h2>
        <div className="stats-section__figures">
          <StatFigure label={t("stats.flights")} value={takenFlights.length} />
          <StatFigure label={t("stats.ferries")} value={takenFerries.length} />
          <StatFigure
            label={t("stats.timezoneJumped")}
            value={stats.numberTimezonesJumped}
          />
        </div>
        <div className="stats-section__panels">
          <TransportCard
            cityBiggestTimezoneJump={stats.cityBiggestTimezoneJump}
            cityBiggestTimezoneJumpTravel={stats.cityBiggestTimezoneJumpTravel}
            maxFerry={stats.maxFerry}
            maxFlight={stats.maxFlight}
            minFerry={stats.minFerry}
            minFlight={stats.minFlight}
            takenFerries={takenFerries}
            takenFlights={takenFlights}
          />
          <TransportModesCard
            data={stats.transportModeStats}
            title={t("stats.transportModes")}
          />
          <CompaniesCard
            ferryCompanyStats={stats.ferryCompanyStats}
            flightCompanyStats={stats.flightCompanyStats}
          />
        </div>
      </section>

      <section className="stats-section">
        <h2 className="stats-section__label eyebrow">{t("stats.time")}</h2>
        <div className="stats-section__figures">
          <StatFigure label={t("stats.trips")} value={visitedTrips.length} />
          <StatFigure
            label={t("stats.daysAbroad")}
            value={stats.totalDaysAbroad}
          />
          <StatFigure
            label={t("stats.avgTrip")}
            suffix={t("stats.daySuffix")}
            value={stats.avgTripDays}
          />
          <StatFigure
            label={t("stats.yearsTraveling")}
            suffix={t("stats.yearSuffix")}
            value={stats.yearsTraveling}
          />
        </div>
        <div className="stats-section__panels">
          <DaysPerYearCard trips={visitedTrips} />
        </div>
      </section>
    </div>
  );
}
