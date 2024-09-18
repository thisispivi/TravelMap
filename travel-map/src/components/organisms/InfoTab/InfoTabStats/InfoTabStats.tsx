import { memo } from "react";
import "./InfoTabStats.scss";
import { visitedCities, visitedCountries } from "../../../../data";
import useLanguage from "../../../../hooks/language/language";
import { Continent } from "../../../../core/typings/Continent";
import {
  Card,
  Column,
  ContinentCitiesRow,
  ContinentRow,
  Row,
} from "../../../molecules";
import {
  ChevronIcon,
  ContinentsIcon,
  HomeIcon,
  ItalyFlag,
  MarkerBWIcon,
  WorldIcon,
} from "../../../../assets";
import { CountryFlag } from "../../../atoms";

interface InfoTabStatsProps {
  className?: string;
  isVisible?: boolean;
}

export default memo(function InfoTabStats({
  className = "",
  isVisible = false,
}: InfoTabStatsProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  }
  const muraveraCoords = { lat: 39.2536, lng: 9.5956 };
  const distances = visitedCities.map((city) => ({
    distance: haversineDistance(
      city.coordinates[0],
      city.coordinates[1],
      muraveraCoords.lat,
      muraveraCoords.lng,
    ),
    city,
  }));
  const furthestCity = distances.reduce((prev, current) =>
    prev.distance > current.distance ? prev : current,
  ).city;
  const distance = distances.reduce((prev, current) =>
    prev.distance > current.distance ? prev : current,
  ).distance;

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
      <div className="info-tab-stats__header">
        <h1>{t("stats.title")}</h1>
      </div>
      <div className="info-tab-stats__content" id="info-tab">
        <Column className="info-tab-stats__first-column">
          <h2>{t("stats.visited")}</h2>
          <Row className="first-row">
            <Card className="cities-card">
              <b>{visitedCities.length}</b>
              <b className="text">{t("stats.cities")}</b>
            </Card>
            <Card className="countries-card">
              <b>{Object.keys(visitedCountries).length}</b>
              <b className="text">{t("stats.countries")}</b>
            </Card>
            <Card className="continents-card">
              <b>{visitedContinents.length}</b>
              <b className="text">{t("stats.continents")}</b>
            </Card>
          </Row>
        </Column>
        <Column className="earth-row column--w-100">
          <Card className="earth-card">
            <div className="earth-card__icon">
              <WorldIcon className="colored" />
              <WorldIcon
                className="bw"
                style={{
                  clipPath: `inset(0 0 ${(Object.keys(visitedCountries).length / 195) * 100}%)`,
                }}
              />
            </div>
            <div className="text-container">
              <b>
                {((Object.keys(visitedCountries).length / 195) * 100).toFixed(
                  2,
                )}
                %
              </b>
              <b className="text">{t("stats.ofTheWorld")}</b>
            </div>
          </Card>
        </Column>
        <Column className="furthest-city-row column--w-100">
          <h2>{t("stats.furthestCity")}</h2>
          <Card className="furthest-city__card">
            <div className="furthest-city__start">
              <span>
                <p>{t("cities.Muravera")}</p>
                <ItalyFlag className="flag" />
              </span>
              <HomeIcon className="home__icon" />
            </div>
            <div className="furthest-city__distance">
              <b>{distance.toFixed(2)} km</b>
              <div className="border" />
              <ChevronIcon className="chevron__icon" />
            </div>
            <div className="furthest-city__end">
              <span>
                <p>{furthestCity.name}</p>
                <CountryFlag
                  className="flag"
                  countryId={furthestCity.country.id}
                />
              </span>
              <MarkerBWIcon className="marker__icon" />
            </div>
          </Card>
        </Column>
        <Column className="continents-row column--w-100">
          <h2>{t("stats.continents")}</h2>
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
          <h3>{t("stats.countriesPerContinent")}</h3>
          <Row className="row--wrap continents__cities__wrap">
            {continentCountries.map((continent) => (
              <ContinentCitiesRow
                continent={continent.continent}
                key={continent.continent}
                numberOfCities={continent.countries.length}
              />
            ))}
          </Row>
        </Column>
      </div>
    </div>
  );
});
