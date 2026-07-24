import "./StatsGrid.scss";

import { ReactNode, useEffect, useRef, useState } from "react";

import AirplaneIcon from "@/assets/icons/Airplane.svg?react";
import CalendarIcon from "@/assets/icons/Calendar.svg?react";
import CameraIcon from "@/assets/icons/Camera.svg?react";
import CityIcon from "@/assets/icons/City.svg?react";
import FerryIcon from "@/assets/icons/Ferry.svg?react";
import GlobeIcon from "@/assets/icons/Globe.svg?react";
import MapIcon from "@/assets/icons/Map.svg?react";
import MoonIcon from "@/assets/icons/Moon.svg?react";
import SunIcon from "@/assets/icons/Sun.svg?react";
import TimezoneIcon from "@/assets/icons/Timezone.svg?react";
import UnescoIcon from "@/assets/icons/Unesco.svg?react";
import {
  takenFerries,
  takenFlights,
  visitedCities,
  visitedTrips,
} from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { useStatsData } from "@/hooks/stats/useStatsData";
import { classNames } from "@/utils/className";
import { constants } from "@/utils/parameters";

import { StatTile } from "../../atoms/StatTile/StatTile";
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
 *
 * @property {string} [className] - Additional class names to apply to the root element.
 * @property {boolean} [isVisible] - When true the grid is displayed (default: false).
 */
export type StatsGridProps = {
  className?: string;
  isVisible?: boolean;
};
/**
 * StatsGrid component
 *
 * Bento-grid statistics dashboard. Delegates stat computation to
 * `useStatsData` and rendering to focused card components. Handles only the
 * grid layout, scroll-shadow state, and the header.
 *
 * @component
 *
 * @param {StatsGridProps} props
 * @param {string} [props.className] - Additional class names
 * @param {boolean} [props.isVisible] - Controls CSS visibility
 * @returns {ReactNode} The stats dashboard
 */
export function StatsGrid({
  className = "",
  isVisible = false,
}: StatsGridProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const stats = useStatsData();
  const bentoRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const { TOTAL_CONTINENTS, TOTAL_COUNTRIES, TOTAL_UNESCO_SITES } = constants;
  const updateScrollableState = () => {
    const bento = bentoRef.current;
    if (!bento) return;
    setIsScrollable(bento.scrollHeight > bento.clientHeight + 1);
  };
  const updateScrollableStateRef = useRef(updateScrollableState);

  useEffect(() => {
    updateScrollableStateRef.current = updateScrollableState;
  });

  useEffect(() => {
    const handleScrollableChange = () => updateScrollableStateRef.current();

    handleScrollableChange();
    const bento = bentoRef.current;
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleScrollableChange);
    if (bento) resizeObserver?.observe(bento);
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

      <div
        className={classNames(
          "stats-bento",
          isScrollable && "stats-bento--scrollable",
        )}
        id="stats-bento"
        ref={bentoRef}
      >
        <MileageCard
          furthestCity={stats.furthestCity}
          nearestCity={stats.nearestCity}
          totalMileage={stats.totalMileage}
          totalMileageAroundEarth={stats.totalMileageAroundEarth}
          totalMileageToMoon={stats.totalMileageToMoon}
        />

        <CoverageCard
          allContinents={stats.allContinents}
          totalContinents={TOTAL_CONTINENTS}
          visitedContinents={stats.visitedContinents}
        />

        <StatTile
          className="bento-stat--globe"
          icon={GlobeIcon}
          label={t("stats.countries")}
          suffix={`/ ${TOTAL_COUNTRIES}`}
          value={stats.visitedCountriesCount}
        />
        <StatTile
          icon={CityIcon}
          label={t("stats.cities")}
          value={visitedCities.length}
        />
        <StatTile
          icon={MapIcon}
          label={t("stats.trips")}
          value={visitedTrips.length}
        />
        <StatTile
          icon={SunIcon}
          label={t("stats.daysAbroad")}
          value={stats.totalDaysAbroad}
        />

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

        <PopulationCard cities={visitedCities} />

        <DaysPerYearCard trips={visitedTrips} />

        <StatTile
          icon={AirplaneIcon}
          label={t("stats.flights")}
          value={takenFlights.length}
        />
        <StatTile
          icon={FerryIcon}
          label={t("stats.ferries")}
          value={takenFerries.length}
        />
        <StatTile
          icon={TimezoneIcon}
          label={t("stats.timezoneJumped")}
          value={stats.numberTimezonesJumped}
        />
        <StatTile
          className="bento-stat--calendar"
          icon={CalendarIcon}
          label={t("stats.avgTrip")}
          suffix={t("stats.daySuffix")}
          value={stats.avgTripDays}
        />
        <StatTile
          className="bento-stat--wide"
          icon={CameraIcon}
          label={t("stats.media")}
          value={stats.totalMediaTaken.toLocaleString(currLanguage)}
        />
        <StatTile
          className="bento-stat--wide"
          icon={UnescoIcon}
          label={t("stats.unesco")}
          suffix={`/ ${TOTAL_UNESCO_SITES}`}
          value={stats.numUnescoSites}
        />
        <StatTile
          className="bento-stat--wide bento-stat--hide-compact"
          icon={MoonIcon}
          label={t("stats.yearsTraveling")}
          suffix={t("stats.yearSuffix")}
          value={stats.yearsTraveling}
        />

        <ContinentsChartCard data={stats.continentCities} />

        <CurrencyCard currencies={stats.usedCurrencies} />

        <CompaniesCard
          ferryCompanyStats={stats.ferryCompanyStats}
          flightCompanyStats={stats.flightCompanyStats}
        />

        <div className="bento-panel--stack">
          <TransportModesCard
            className="bento-detail card--box-shadow bento-detail__top--no-mb"
            data={stats.transportModeStats}
            title={t("stats.transportModes")}
          />
          <CitiesPerCountryCard
            className="bento-detail bento-cities-per-country card--box-shadow bento-detail__top--no-mb"
            data={stats.countryVisitStats}
            maxItems={10}
          />
        </div>
      </div>
    </div>
  );
}
