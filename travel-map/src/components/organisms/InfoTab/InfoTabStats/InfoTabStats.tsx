import { memo, JSX } from "react";
import "./InfoTabStats.scss";
import {
  takenFlights,
  visitedCities,
  visitedCountries,
} from "../../../../data";
import useLanguage from "../../../../hooks/language/language";
import {
  Card,
  CityRow,
  Column,
  ContinentRow,
  FlightRow,
  Row,
} from "../../../molecules";
import {
  AirportIcon,
  CityIcon,
  ContinentsIcon,
  EarthFlatIcon,
  GlobeIcon,
  MoonFlatIcon,
} from "../../../../assets";
import { ContinentsBarChart, FlightsDonutChart } from "../../../atoms";
import {
  getFurthestAndNearestCity,
  getMinAndMaxFlight,
  getTotalMileage,
} from "../../../../utils/distance";
import { Muravera } from "../../../../data/Italy/Muravera/Muravera";
import { Continent } from "../../../../core";
import { formatMileage } from "../../../../utils/format";

interface InfoTabStatsProps {
  className?: string;
  isVisible?: boolean;
}

/**
 * The info tab stats component
 *
 * The info tab stats component is used to display the stats of the user.
 *
 * @component
 *
 * @param {InfoTabStatsProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab stats
 * @param {boolean} props.isVisible - The visibility of the info tab stats
 * @returns {JSX.Element} - The info tab stats
 */
export default memo(function InfoTabStats({
  className = "",
  isVisible = false,
}: InfoTabStatsProps): JSX.Element {
  const { t, currLanguage } = useLanguage(["home"]);

  const { furthest: furthestCity, nearest: nearestCity } =
    getFurthestAndNearestCity(visitedCities, Muravera);
  const { max: maxFlight, min: minFlight } = getMinAndMaxFlight(takenFlights);
  const totalMileage = getTotalMileage(takenFlights);

  const visitedContinents = visitedCities.reduce((prev, current) => {
    if (!prev.includes(current.country.continent)) {
      prev.push(current.country.continent);
    }
    return prev;
  }, [] as Continent[]);

  const continentCities = Object.values(Continent)
    .map((continent) => {
      const numberOfCities = visitedCities.filter(
        (country) => country.country.continent === continent
      ).length;
      const numberOfCountries = Object.values(visitedCountries).filter(
        (country) => country.continent === continent
      ).length;
      return {
        continent,
        countries: numberOfCountries,
        cities: numberOfCities,
      };
    })
    .sort((a, b) => b.countries - a.countries);

  return (
    <div
      className={`info-tab-stats ${className} ${isVisible ? "info-tab-stats--visible" : ""}`}
    >
      <div className="info-tab-stats__header">
        <h1>{t("stats.title")}</h1>
      </div>
      <div className="info-tab-stats__content" id="info-tab">
        <Row className="info-tab-stats__cards row--wrap">
          <Card className="info-tab-stats__card__countries card--box-shadow">
            <GlobeIcon className="info-tab-stats__card__countries__icon" />
            <p>{t("stats.countries")}</p>
            <b>{Object.keys(visitedCountries).length}</b>
          </Card>
          <Card className="info-tab-stats__card__cities card--box-shadow">
            <CityIcon className="info-tab-stats__card__cities__icon" />
            <p>{t("stats.cities")}</p>
            <b>{visitedCities.length}</b>
          </Card>
          <Card className="info-tab-stats__card__flights card--box-shadow">
            <AirportIcon className="info-tab-stats__card__flights__icon" />
            <p>{t("stats.flights")}</p>
            <b>{takenFlights.length}</b>
          </Card>
        </Row>
        <Card className="info-tab-stats__card info-tab-stats__card--flights card--box-shadow">
          <Column className="info-tab-stats__card__main">
            <h2>{t("stats.flights")}</h2>
            <FlightsDonutChart takenFlights={takenFlights} />
          </Column>
          <Column className="info-tab-stats__card__row">
            <p className="info-tab-stats__card__row__title">
              {t("stats.firstFlight")}
            </p>
            <FlightRow flight={takenFlights[0]} />
          </Column>
          <Column className="info-tab-stats__card__row">
            <p className="info-tab-stats__card__row__title">
              {t("stats.lastFlight")}
            </p>
            <FlightRow flight={takenFlights[takenFlights.length - 1]} />
          </Column>
          <Column className="info-tab-stats__card__row">
            <p className="info-tab-stats__card__row__title">
              {t("stats.longestFlight")}
            </p>
            <FlightRow flight={maxFlight} />
          </Column>
          <Column className="info-tab-stats__card__row">
            <p className="info-tab-stats__card__row__title">
              {t("stats.shortestFlight")}
            </p>
            <FlightRow flight={minFlight} />
          </Column>
        </Card>
        <Card className="info-tab-stats__card info-tab-stats__card--mileage card--box-shadow">
          <Column className="info-tab-stats__card__main">
            <h2>{t("stats.mileage")}</h2>
            <Column className="info-tab-stats__card__main__total-mileage">
              <p>{t("stats.totalMileage")}</p>
              <b>{`${formatMileage(totalMileage, currLanguage)} km`}</b>
            </Column>
            <Row className="info-tab-stats__card__main__mileage-planets">
              <Column className="info-tab-stats__card__main__mileage-planets--earth">
                <EarthFlatIcon className="info-tab-stats__card__main__mileage-planets__earth-icon" />
                <b>{(Number(totalMileage) / 40075).toFixed(2)}x</b>
                <p>{t("stats.aroundEarth")}</p>
              </Column>
              <Column className="info-tab-stats__card__main__mileage-planets--moon">
                <MoonFlatIcon className="info-tab-stats__card__main__mileage-planets__moon-icon" />
                <b>{(Number(totalMileage) / 384400).toFixed(2)}x</b>
                <p>{t("stats.toMoon")}</p>
              </Column>
            </Row>
          </Column>
          <Column className="info-tab-stats__card__row">
            <p className="info-tab-stats__card__row__title">
              {t("stats.furthestCity")}
            </p>
            <CityRow eCity={furthestCity} />
          </Column>
          <Column className="info-tab-stats__card__row">
            <p className="info-tab-stats__card__row__title">
              {t("stats.nearestCity")}
            </p>
            <CityRow eCity={nearestCity} />
          </Column>
        </Card>
        <Card className="info-tab-stats__card info-tab-stats__card--continents card--box-shadow">
          <Column className="info-tab-stats__card__main">
            <h2 className="continents__title">{t("stats.continents")}</h2>
            <ContinentsIcon
              className={`continents__icon
            ${visitedContinents.includes(Continent.Africa) ? "" : "africa--not-visited"}
            ${visitedContinents.includes(Continent.Asia) ? "" : "asia--not-visited"}
            ${visitedContinents.includes(Continent.Europe) ? "" : "europe--not-visited"}
            ${visitedContinents.includes(Continent.NorthAmerica) ? "" : "north-america--not-visited"}
            ${visitedContinents.includes(Continent.Oceania) ? "" : "oceania--not-visited"}
            ${visitedContinents.includes(Continent.SouthAmerica) ? "" : "south-america--not-visited"}
            `}
            />
            <Row className="row--wrap row--center continents__wrap">
              {Object.keys(Continent).map((continent) => (
                <ContinentRow
                  continent={continent as Continent}
                  isVisited={visitedContinents.includes(continent as Continent)}
                  key={continent}
                />
              ))}
            </Row>
          </Column>
          <Column className="info-tab-stats__card__row">
            <ContinentsBarChart data={continentCities} />
          </Column>
        </Card>
      </div>
    </div>
  );
});
