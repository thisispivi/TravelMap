import { memo } from "react";
import "./InfoTabStats.scss";
import { visitedCities, visitedCountries } from "../../../../data";
import useLanguage from "../../../../hooks/language/language";
import { Continent } from "../../../../core/typings/Continent";
import {
  Column,
  ContinentCitiesRow,
  ContinentRow,
  Row,
} from "../../../molecules";
import { ContinentsIcon } from "../../../../assets";

interface InfoTabStatsProps {
  className?: string;
  isVisible?: boolean;
}

export default memo(function InfoTabStats({
  className = "",
  isVisible = false,
}: InfoTabStatsProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  const allCities = Object.keys(visitedCountries);

  const muraveraCoords = { lat: 39.2536, lng: 9.5956 };
  const furthestCity = visitedCities.reduce((prev, current) => {
    const prevDist = Math.sqrt(
      Math.pow(prev.coordinates[0] - muraveraCoords.lat, 2) +
        Math.pow(prev.coordinates[1] - muraveraCoords.lng, 2)
    );
    const currDist = Math.sqrt(
      Math.pow(current.coordinates[0] - muraveraCoords.lat, 2) +
        Math.pow(current.coordinates[1] - muraveraCoords.lng, 2)
    );
    return prevDist > currDist ? prev : current;
  });
  const distance = Math.sqrt(
    Math.pow(furthestCity.coordinates[0] - muraveraCoords.lat, 2) +
      Math.pow(furthestCity.coordinates[1] - muraveraCoords.lng, 2)
  );

  const visitedContinents = visitedCities.reduce((prev, current) => {
    if (!prev.includes(current.country.continent)) {
      prev.push(current.country.continent);
    }
    return prev;
  }, [] as Continent[]);

  const continentCountries = visitedContinents.map((continent) => {
    const countries = visitedCities.reduce((prev, current) => {
      if (current.country.continent === continent) {
        prev.push(current.country.id);
      }
      return prev;
    }, [] as string[]);
    return { continent, countries: [...new Set(countries)] };
  });

  return (
    <div
      className={`info-tab-stats ${className} ${isVisible ? "info-tab-stats--visible" : ""}`}
    >
      <div className={`info-tab-stats__header`}>
        <h1>{t("stats.title")}</h1>
      </div>
      <div className={`info-tab-stats__content`} id="info-tab">
        <div className="card">
          Countries Visited: {Object.keys(visitedCountries).length}
          Total Countries: 195 Percentage:{" "}
          {((Object.keys(visitedCountries).length / 195) * 100).toFixed(2)}%
        </div>
        <div className="card">
          Cities Visited: {visitedCities.length} Total Cities:{" "}
          {allCities.length} Percentage:{" "}
          {((visitedCities.length / allCities.length) * 100).toFixed(2)}%
        </div>
        <div className="card">
          Furthest City: {furthestCity.name} ({furthestCity.country.id})
          Distance: {distance.toFixed(2)} km
        </div>
        <Column className="continents-row column--w-100">
          <h2>Continents</h2>
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
          <h3>Countries per Continent:</h3>
          <Row className="row--wrap continents__cities__wrap">
            {continentCountries.map((continent) => (
              <ContinentCitiesRow
                key={continent.continent}
                continent={continent.continent}
                numberOfCities={continent.countries.length}
              />
            ))}
          </Row>
        </Column>
      </div>
    </div>
  );
});
