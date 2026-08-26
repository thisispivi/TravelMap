import "./StatsGrid.scss";

import { ReactNode, useEffect, useRef, useState } from "react";

import {
  takenFerries,
  takenFlights,
  visitedCities,
  visitedTrips,
} from "@/data/world";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { constants } from "@/shared/lib/parameters";

import { useStatsData } from "../../lib/useStatsData";
import { StatFigure } from "../StatFigure/StatFigure";
import { CitiesPerCountryCard } from "./cards/CitiesPerCountryCard";
import { CompaniesCard } from "./cards/CompaniesCard";
import { ContinentsChartCard } from "./cards/ContinentsChartCard";
import { CoverageCard } from "./cards/CoverageCard";
import { CurrencyCard } from "./cards/CurrencyCard";
import { DaysPerYearCard } from "./cards/DaysPerYearCard";
import { MileageCard } from "./cards/MileageCard";
import { PopulationCard } from "./cards/PopulationCard";
import { TransportCard } from "./cards/TransportCard";
import { TransportModesCard } from "./cards/TransportModesCard";

/**
 * Props for the StatsGrid component.
 * @property {string} [className] - Additional class names to apply to the root element.
 * @property {boolean} [isVisible] - When true the sheet is displayed (default: false).
 */
export type StatsGridProps = {
  className?: string;
  isVisible?: boolean;
};

/**
 * StatsGrid component
 * The statistics sheet. Groups every measure under four headings - coverage,
 * distance, transport and time - so the record reads as sections rather than
 * as an undifferentiated wall of tiles. Computation belongs to `useStatsData`;
 * this owns only the composition and the scroll state.
 * @component
 * @param {StatsGridProps} props - The stats grid props
 * @param {string} [props.className=""] - Additional class names
 * @param {boolean} [props.isVisible=false] - Controls CSS visibility
 * @returns {ReactNode} The statistics sheet
 */
export function StatsGrid({
  className = "",
  isVisible = false,
}: StatsGridProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const stats = useStatsData();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const { TOTAL_CONTINENTS, TOTAL_COUNTRIES, TOTAL_UNESCO_SITES } = constants;
  const hasData = visitedTrips.length > 0 || visitedCities.length > 0;

  /**
   * Recomputes whether the statistics sheet overflows, so its scroll padding
   * is only applied when a scrollbar is actually present.
   * @returns {void}
   */
  const updateScrollableState = () => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    setIsScrollable(sheet.scrollHeight > sheet.clientHeight + 1);
  };
  const updateScrollableStateRef = useRef(updateScrollableState);

  useEffect(() => {
    updateScrollableStateRef.current = updateScrollableState;
  });

  useEffect(() => {
    /**
     * Recalculates whether the statistics sheet can scroll.
     * @returns {void}
     */
    const handleScrollableChange = (): void =>
      updateScrollableStateRef.current();

    handleScrollableChange();
    const sheet = sheetRef.current;
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleScrollableChange);
    if (sheet) resizeObserver?.observe(sheet);
    window.addEventListener("resize", handleScrollableChange);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleScrollableChange);
    };
  }, [isVisible, stats]);

  return (
    <div
      className={classNames(
        "stats-grid",
        className,
        isVisible && "stats-grid--visible",
      )}
    >
      <div className="stats-grid__header">
        <h1>{t("stats.title")}</h1>
      </div>

      {hasData ? (
        <div
          className={classNames(
            "stats-sheet",
            isScrollable && "stats-sheet--scrollable",
          )}
          id="stats-sheet"
          ref={sheetRef}
        >
          <section className="stats-section">
            <h2 className="stats-section__label eyebrow">
              {t("stats.coverage")}
            </h2>
            <div className="stats-section__figures">
              <StatFigure
                label={t("stats.countries")}
                suffix={`/ ${TOTAL_COUNTRIES}`}
                value={stats.visitedCountriesCount}
              />
              <StatFigure
                label={t("stats.cities")}
                value={visitedCities.length}
              />
              <StatFigure
                label={t("stats.unesco")}
                suffix={`/ ${TOTAL_UNESCO_SITES}`}
                value={stats.numUnescoSites}
              />
              <StatFigure
                label={t("stats.media")}
                value={stats.totalMediaTaken.toLocaleString(currLanguage)}
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
            <h2 className="stats-section__label eyebrow">
              {t("stats.mileage")}
            </h2>
            <div className="stats-section__panels">
              {stats.furthestCity && stats.nearestCity ? (
                <MileageCard
                  furthestCity={stats.furthestCity}
                  nearestCity={stats.nearestCity}
                  totalMileage={stats.totalMileage}
                  totalMileageAroundEarth={stats.totalMileageAroundEarth}
                  totalMileageToMoon={stats.totalMileageToMoon}
                />
              ) : null}
            </div>
          </section>

          <section className="stats-section">
            <h2 className="stats-section__label eyebrow">
              {t("stats.transport")}
            </h2>
            <div className="stats-section__figures">
              <StatFigure
                label={t("stats.flights")}
                value={takenFlights.length}
              />
              <StatFigure
                label={t("stats.ferries")}
                value={takenFerries.length}
              />
              <StatFigure
                label={t("stats.timezoneJumped")}
                value={stats.numberTimezonesJumped}
              />
            </div>
            <div className="stats-section__panels">
              <TransportCard
                cityBiggestTimezoneJump={stats.cityBiggestTimezoneJump}
                cityBiggestTimezoneJumpTravel={
                  stats.cityBiggestTimezoneJumpTravel
                }
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
              <StatFigure
                label={t("stats.trips")}
                value={visitedTrips.length}
              />
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
      ) : (
        <EmptyState message={t("stats.empty")} />
      )}
    </div>
  );
}
