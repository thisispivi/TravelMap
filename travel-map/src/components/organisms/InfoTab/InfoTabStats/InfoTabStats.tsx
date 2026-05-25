import "./InfoTabStats.scss";

import { ComponentType, JSX, SVGProps, useMemo } from "react";

import {
  AirplaneIcon,
  CalendarIcon,
  CameraIcon,
  CityIcon,
  ContinentsIcon,
  EarthFlatIcon,
  FerryIcon,
  GlobeIcon,
  MapIcon,
  MoonFlatIcon,
  MoonIcon,
  SunIcon,
  TimezoneIcon,
  UnescoIcon,
} from "@/assets";
import { Continent } from "@/core";
import {
  takenFerries,
  takenFlights,
  visitedCities,
  visitedCountries,
  visitedTrips,
} from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { getTotalMediaTaken } from "@/utils/cities";
import { getContinentsByCities, getContinentStats } from "@/utils/continent";
import { getCurrenciesFromCountries } from "@/utils/countries";
import {
  getFurthestAndNearestCity,
  getMinAndMaxTransport,
  getTotalMileage,
} from "@/utils/distance";
import { formatMileage } from "@/utils/format";
import { constants, parameters } from "@/utils/parameters";
import {
  getCityBiggestTimezoneJump,
  getNumberOfTimezonesJumped,
} from "@/utils/timezone";

import {
  BarChartYears,
  ContinentsBarChart,
  PopulationBarChart,
  TransportsDonutChart,
} from "../../../atoms";
import {
  Card,
  CityRow,
  ContinentRow,
  CurrencyRow,
  TimezoneRow,
  TransportRow,
} from "../../../molecules";

interface InfoTabStatsProps {
  className?: string;
  isVisible?: boolean;
}

type SvgIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

export function InfoTabStats({
  className = "",
  isVisible = false,
}: InfoTabStatsProps): JSX.Element {
  const { t, currLanguage } = useLanguage(["home"]);
  const {
    EARTH_CIRCUMFERENCE,
    MOON_DISTANCE,
    TOTAL_CONTINENTS,
    TOTAL_COUNTRIES,
    TOTAL_UNESCO_SITES,
  } = constants;

  const stats = useMemo(() => {
    const visitedCountriesCount = visitedCountries.length;

    const { furthest: furthestCity, nearest: nearestCity } =
      getFurthestAndNearestCity(visitedCities, parameters.birthCity);

    const { max: maxFlight, min: minFlight } =
      getMinAndMaxTransport(takenFlights);
    const { max: maxFerry, min: minFerry } =
      getMinAndMaxTransport(takenFerries);

    const totalMileage = getTotalMileage(takenFlights, takenFerries);
    const totalMileageAroundEarth = (
      Number(totalMileage) / EARTH_CIRCUMFERENCE
    ).toFixed(2);
    const totalMileageToMoon = (Number(totalMileage) / MOON_DISTANCE).toFixed(
      2,
    );

    const visitedContinents = getContinentsByCities(visitedCities);
    const allContinents = Object.values(Continent).filter(
      (v): v is Continent => typeof v === "string",
    );
    const continentCities = allContinents
      .map((c) => getContinentStats(c, visitedCities, visitedCountries))
      .sort((a, b) => b.countries - a.countries);

    const cityBiggestTimezoneJump = getCityBiggestTimezoneJump(visitedCities);
    const numberTimezonesJumped = getNumberOfTimezonesJumped(visitedCities);
    const totalMediaTaken = getTotalMediaTaken(visitedCities);
    const usedCurrencies = getCurrenciesFromCountries(visitedCountries);
    const numUnescoSites = Object.values(parameters.stats.unescoSites).reduce(
      (acc, sites) => acc + sites.length,
      0,
    );

    const totalDaysAbroad = visitedTrips.reduce((acc, trip) => {
      return (
        acc +
        Math.round(
          (trip.eDate.getTime() - trip.sDate.getTime()) / (1000 * 60 * 60 * 24),
        )
      );
    }, 0);
    const avgTripDays = Math.round(totalDaysAbroad / visitedTrips.length);
    const firstTripYear = Math.min(
      ...visitedTrips.map((t) => t.sDate.getFullYear()),
    );
    const yearsTraveling = new Date().getFullYear() - firstTripYear;

    return {
      visitedCountriesCount,
      furthestCity,
      nearestCity,
      maxFlight,
      minFlight,
      maxFerry,
      minFerry,
      totalMileage,
      totalMileageAroundEarth,
      totalMileageToMoon,
      visitedContinents,
      allContinents,
      continentCities,
      cityBiggestTimezoneJump,
      numberTimezonesJumped,
      totalMediaTaken,
      usedCurrencies,
      numUnescoSites,
      totalDaysAbroad,
      avgTripDays,
      yearsTraveling,
    };
  }, [EARTH_CIRCUMFERENCE, MOON_DISTANCE]);

  return (
    <div
      className={`info-tab-stats ${className} ${isVisible ? "info-tab-stats--visible" : ""}`}
    >
      <div className="info-tab-stats__header">
        <h1>{t("stats.title")}</h1>
      </div>

      <div className="stats-bento" id="info-tab">
        <Card className="bento-card bento-card--large bento-detail card--box-shadow">
          <div className="bento-detail__top">
            <h2>{t("stats.mileage")}</h2>
            <div className="bento-mileage__total">
              <p>{t("stats.totalMileage")}</p>
              <b>{formatMileage(stats.totalMileage, currLanguage)} km</b>
            </div>
            <div className="bento-mileage__planets">
              <div className="bento-mileage__planet">
                <EarthFlatIcon className="bento-mileage__planet-icon" />
                <b>{stats.totalMileageAroundEarth}×</b>
                <p>{t("stats.aroundEarth")}</p>
              </div>
              <div className="bento-mileage__planet">
                <MoonFlatIcon className="bento-mileage__planet-icon" />
                <b>{stats.totalMileageToMoon}×</b>
                <p>{t("stats.toMoon")}</p>
              </div>
            </div>
          </div>
          <div className="bento-detail__rows">
            <div className="bento-detail__row">
              <p className="bento-detail__row-label">
                {t("stats.furthestCity")}
              </p>
              <CityRow eCity={stats.furthestCity} />
            </div>
            <div className="bento-detail__row">
              <p className="bento-detail__row-label">
                {t("stats.nearestCity")}
              </p>
              <CityRow eCity={stats.nearestCity} />
            </div>
          </div>
        </Card>

        <Card className="bento-card bento-card--medium bento-detail bento-continents card--box-shadow">
          <div className="bento-continents__body">
            <div className="bento-continents__header">
              <h2>{t("stats.coverage")}</h2>
              <div className="bento-continents__score">
                <b>{stats.visitedContinents.length}</b>
                <span>/ {TOTAL_CONTINENTS}</span>
              </div>
            </div>
            <ContinentsIcon
              className={[
                "bento-continents__map",
                stats.visitedContinents.includes(Continent.AFRICA)
                  ? ""
                  : "africa--not-visited",
                stats.visitedContinents.includes(Continent.ASIA)
                  ? ""
                  : "asia--not-visited",
                stats.visitedContinents.includes(Continent.EUROPE)
                  ? ""
                  : "europe--not-visited",
                stats.visitedContinents.includes(Continent.NORTH_AMERICA)
                  ? ""
                  : "north-america--not-visited",
                stats.visitedContinents.includes(Continent.OCEANIA)
                  ? ""
                  : "oceania--not-visited",
                stats.visitedContinents.includes(Continent.SOUTH_AMERICA)
                  ? ""
                  : "south-america--not-visited",
              ]
                .join(" ")
                .trim()}
            />
            <div className="bento-continents__badges">
              {stats.allContinents.map((continent) => (
                <ContinentRow
                  continent={continent}
                  isVisited={stats.visitedContinents.includes(continent)}
                  key={continent}
                />
              ))}
            </div>
          </div>
        </Card>

        <BentoStatCard
          className="bento-stat--globe"
          icon={GlobeIcon}
          label={t("stats.countries")}
          suffix={`/ ${TOTAL_COUNTRIES}`}
          value={stats.visitedCountriesCount}
        />
        <BentoStatCard
          icon={CityIcon}
          label={t("stats.cities")}
          value={visitedCities.length}
        />
        <BentoStatCard
          icon={MapIcon}
          label={t("stats.trips")}
          value={visitedTrips.length}
        />
        <BentoStatCard
          icon={SunIcon}
          label={t("stats.daysAbroad")}
          value={stats.totalDaysAbroad}
        />

        <Card className="bento-card bento-card--full bento-detail bento-transport card--box-shadow">
          <div className="bento-transport__inner">
            <div className="bento-transport__chart">
              <h2>{t("stats.transport")}</h2>
              <TransportsDonutChart
                takenFerries={takenFerries}
                takenFlights={takenFlights}
              />
            </div>
            <div className="bento-transport__rows bento-detail__rows">
              <div className="bento-detail__row">
                <p className="bento-detail__row-label">
                  {t("stats.longestFlight")}
                </p>
                <TransportRow transport={stats.maxFlight} />
              </div>
              <div className="bento-detail__row">
                <p className="bento-detail__row-label">
                  {t("stats.shortestFlight")}
                </p>
                <TransportRow transport={stats.minFlight} />
              </div>
              <div className="bento-detail__row">
                <p className="bento-detail__row-label">
                  {t("stats.longestFerry")}
                </p>
                <TransportRow transport={stats.maxFerry} />
              </div>
              <div className="bento-detail__row">
                <p className="bento-detail__row-label">
                  {t("stats.shortestFerry")}
                </p>
                <TransportRow transport={stats.minFerry} />
              </div>
              {stats.cityBiggestTimezoneJump ? (
                <div className="bento-detail__row">
                  <p className="bento-detail__row-label">
                    {t("stats.biggestTimezoneJump")}
                  </p>
                  <TimezoneRow
                    eCity={stats.cityBiggestTimezoneJump}
                    eDate={stats.cityBiggestTimezoneJump.travels?.[0]?.eDate}
                    sCity={parameters.birthCity}
                    sDate={stats.cityBiggestTimezoneJump.travels?.[0]?.sDate}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <Card className="bento-card bento-card--half bento-detail bento-population card--box-shadow">
          <div className="bento-population__inner">
            <div className="bento-population__left">
              <h2>{t("stats.population")}</h2>
              <p className="bento-detail__subtitle">
                {t("stats.populationTop10")}
              </p>
              <PopulationBarChart data={visitedCities} />
            </div>
          </div>
        </Card>

        <Card className="bento-card bento-card--half bento-detail bento-days-year card--box-shadow">
          <div className="bento-detail__top">
            <h2>{t("stats.daysPerYear")}</h2>
            <BarChartYears trips={visitedTrips} />
          </div>
        </Card>

        <BentoStatCard
          icon={AirplaneIcon}
          label={t("stats.flights")}
          value={takenFlights.length}
        />
        <BentoStatCard
          icon={FerryIcon}
          label={t("stats.ferries")}
          value={takenFerries.length}
        />
        <BentoStatCard
          icon={TimezoneIcon}
          label={t("stats.timezoneJumped")}
          value={stats.numberTimezonesJumped}
        />
        <BentoStatCard
          className="bento-stat--calendar"
          icon={CalendarIcon}
          label={t("stats.avgTrip")}
          suffix={t("stats.daySuffix")}
          value={stats.avgTripDays}
        />
        <BentoStatCard
          className="bento-stat--wide"
          icon={CameraIcon}
          label={t("stats.media")}
          value={stats.totalMediaTaken.toLocaleString(currLanguage)}
        />
        <BentoStatCard
          className="bento-stat--wide"
          icon={UnescoIcon}
          label={t("stats.unesco")}
          suffix={`/ ${TOTAL_UNESCO_SITES}`}
          value={stats.numUnescoSites}
        />
        <BentoStatCard
          className="bento-stat--wide bento-stat--hide-compact"
          icon={MoonIcon}
          label={t("stats.yearsTraveling")}
          suffix={t("stats.yearSuffix")}
          value={stats.yearsTraveling}
        />

        <Card className="bento-card bento-card--half bento-detail bento-continents-chart card--box-shadow">
          <div className="bento-detail__top">
            <h2>{t("stats.coverage")}</h2>
            <ContinentsBarChart data={stats.continentCities} />
          </div>
        </Card>

        <Card className="bento-card bento-card--half bento-detail card--box-shadow">
          <div className="bento-detail__top">
            <h2>{t("stats.currency")}</h2>
          </div>
          <div className="bento-currency">
            {stats.usedCurrencies.map((currency) => (
              <CurrencyRow currency={currency} key={currency} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function BentoStatCard({
  icon: Icon,
  label,
  value,
  suffix,
  className = "",
}: {
  icon: SvgIcon;
  label: string;
  value: string | number;
  suffix?: string;
  className?: string;
}): JSX.Element {
  return (
    <Card className={`bento-stat card--box-shadow ${className}`}>
      <Icon className="bento-stat__icon" />
      <p className="bento-stat__label">{label}</p>
      <div className="bento-stat__value">
        <b>{value}</b>
        {suffix ? <span className="bento-stat__suffix">{suffix}</span> : null}
      </div>
    </Card>
  );
}
