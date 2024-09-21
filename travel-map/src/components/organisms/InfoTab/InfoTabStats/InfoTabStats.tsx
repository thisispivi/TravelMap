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
  Column,
  ContinentCitiesRow,
  ContinentRow,
  FlightRow,
  Row,
} from "../../../molecules";
import { ContinentsIcon } from "../../../../assets";
import { FlightsDonutChart } from "../../../atoms";

interface InfoTabStatsProps {
  className?: string;
  isVisible?: boolean;
}

export default memo(function InfoTabStats({
  className = "",
  isVisible = false,
}: InfoTabStatsProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  // const muraveraCoords = { lat: 39.2536, lng: 9.5956 };
  // const distances = visitedCities.map((city) => ({
  //   distance: haversineDistance(
  //     city.coordinates[0],
  //     city.coordinates[1],
  //     muraveraCoords.lat,
  //     muraveraCoords.lng
  //   ),
  //   city,
  // }));
  // const furthestCity = distances.reduce((prev, current) =>
  //   prev.distance > current.distance ? prev : current
  // ).city;
  // const distance = distances.reduce((prev, current) =>
  //   prev.distance > current.distance ? prev : current
  // ).distance;

  const maxFlight = takenFlights.reduce((prev, current) =>
    prev.distanceInKm > current.distanceInKm ? prev : current
  );
  const minFlight = takenFlights.reduce((prev, current) =>
    prev.distanceInKm < current.distanceInKm ? prev : current
  );

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
            <h4>{t("stats.longestFlight")}</h4>
            <FlightRow flight={maxFlight} />
          </Column>
          <Column className="info-tab-stats__card__row">
            <h4>{t("stats.shortestFlight")}</h4>
            <FlightRow flight={minFlight} />
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
            <h4>{t("stats.countriesPerContinent")}</h4>
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
            <h4>{t("stats.citiesPerContinent")}</h4>
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
