import { memo } from "react";
import "./InfoTabStats.scss";
import {
  takenFlights,
  visitedCities,
  visitedCountries,
} from "../../../../data";
import useLanguage from "../../../../hooks/language/language";
import { Continent } from "../../../../core/typings/Continent";
import {
  Card,
  CityRow,
  Column,
  ContinentCitiesRow,
  ContinentRow,
  FlightRow,
  Row,
} from "../../../molecules";
import {
  ContinentsIcon,
  EarthFlatIcon,
  MoonFlatIcon,
} from "../../../../assets";
import { FlightsDonutChart } from "../../../atoms";
import { Muravera } from "../../../../data/cities/Cagliari/Cagliari";
import {
  getFurthestAndNearestCity,
  getMinAndMaxFlight,
  getTotalMileage,
} from "../../../../utils/distance";

interface InfoTabStatsProps {
  className?: string;
  isVisible?: boolean;
}

export default memo(function InfoTabStats({
  className = "",
  isVisible = false,
}: InfoTabStatsProps): JSX.Element {
  const { t } = useLanguage(["home"]);

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
        <Card className="info-tab-stats__card info-tab-stats__card--flights card--box-shadow">
          <Column className="info-tab-stats__card__main">
            <h2>{t("stats.flights")}</h2>
            <FlightsDonutChart takenFlights={takenFlights} />
          </Column>
          <Column className="info-tab-stats__card__row">
            <p>{t("stats.longestFlight")}</p>
            <FlightRow flight={maxFlight} />
          </Column>
          <Column className="info-tab-stats__card__row">
            <p>{t("stats.shortestFlight")}</p>
            <FlightRow flight={minFlight} />
          </Column>
        </Card>
        <Card className="info-tab-stats__card info-tab-stats__card--mileage card--box-shadow">
          <Column className="info-tab-stats__card__main">
            <h2>{t("stats.mileage")}</h2>
            <Column className="info-tab-stats__card__main__total-mileage">
              <p>{t("stats.totalMileage")}</p>
              <b>{`${totalMileage} km`}</b>
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
            <p>{t("stats.furthestCity")}</p>
            <CityRow eCity={furthestCity} />
          </Column>
          <Column className="info-tab-stats__card__row">
            <p>{t("stats.nearestCity")}</p>
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
            <p>{t("stats.countriesPerContinent")}</p>
            <Row className="row--wrap continents__countries__wrap">
              {continentCities.map((continent) => (
                <ContinentCitiesRow
                  continent={continent.continent}
                  key={continent.continent}
                  numberOfCities={continent.countries}
                />
              ))}
            </Row>
          </Column>
          <Column className="info-tab-stats__card__row">
            <p>{t("stats.citiesPerContinent")}</p>
            <Row className="row--wrap continents__cities__wrap">
              {continentCities.map((continent) => (
                <ContinentCitiesRow
                  continent={continent.continent}
                  key={continent.continent}
                  numberOfCities={continent.cities}
                />
              ))}
            </Row>
          </Column>
        </Card>
      </div>
    </div>
  );
});
