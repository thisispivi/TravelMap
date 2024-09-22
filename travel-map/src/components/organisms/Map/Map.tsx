import { memo, useContext, useState } from "react";
import { HomeContext } from "../../pages/Home/Home";
import { City, Country as CountryCore } from "../../../core";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import "./Map.scss";
import { Loading, Marker } from "../../atoms";
import { worldData } from "../../../assets";
import { MapTooltip } from "..";
import { parameters } from "../../../utils/parameters";

export interface MapProps {
  livedCities: City[];
  visitedCountries: Record<string, CountryCore>;
  visitedCities: City[];
  futureCities: City[];
  currHoveredCity: City | null;
  setCurrentHoveredCity: (city: City | null) => void;
}

export default memo(function Map({
  visitedCountries,
  visitedCities,
  futureCities,
  livedCities,
}: MapProps): JSX.Element {
  const context = useContext(HomeContext);
  const { isDarkTheme, hoveredCity, setHoveredCity, mapPosition, responsive } =
    context!;

  const [isLoaded, setIsLoaded] = useState(false);

  const getCountryFillColor = (country: string) => {
    const visitedCountry = visitedCountries[country.replace(" ", "")];
    if (visitedCountry) {
      return visitedCountry.fillColor;
    }
    return isDarkTheme ? "#1a1a1a" : "#dadada";
  };

  const sortByLatitudeAndLongitude = (a: City, b: City) => {
    const fCordA = a.coordinates[0];
    const fCordB = b.coordinates[0];
    const sCordA = a.coordinates[1];
    const sCordB = b.coordinates[1];
    return sCordA < sCordB
      ? 1
      : sCordA > sCordB
        ? -1
        : fCordA < fCordB
          ? -1
          : fCordA > fCordB
            ? 1
            : 0;
  };
  const sortedVisitedCities = visitedCities.sort(sortByLatitudeAndLongitude);
  const sortedFutureCities = futureCities.sort(sortByLatitudeAndLongitude);

  return (
    <div className="map-container" style={{ ...responsive.window }}>
      {!isLoaded ? (
        <div className="loading" style={{ ...responsive.window }}>
          <Loading />
        </div>
      ) : null}
      <ComposableMap
        className="map"
        data-tip=""
        projection="geoMercator"
        {...responsive.window}
      >
        <ZoomableGroup
          center={mapPosition.center}
          maxZoom={parameters.map.defaultMaxZoom}
          minZoom={parameters.map.defaultMinZoom}
          zoom={mapPosition.zoom}
        >
          <Geographies geography={worldData}>
            {({ geographies }) =>
              geographies.map((geo, i) => {
                if (i === geographies.length - 1) setIsLoaded(true);
                return (
                  <Geography
                    fill={getCountryFillColor(geo.properties.name)}
                    geography={geo}
                    key={geo.rsmKey}
                    strokeWidth={0}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
          {isLoaded
            ? sortedFutureCities.map((city, i) => (
                <Marker
                  city={city}
                  hoveredCity={hoveredCity}
                  isFuture
                  key={i}
                  setHoveredCity={setHoveredCity}
                />
              ))
            : null}
          {isLoaded
            ? sortedVisitedCities.map((city, i) => (
                <Marker
                  city={city}
                  hoveredCity={hoveredCity}
                  key={i}
                  setHoveredCity={setHoveredCity}
                />
              ))
            : null}
          {isLoaded
            ? livedCities.map((city, i) => (
                <Marker
                  city={city}
                  hoveredCity={hoveredCity}
                  isLived
                  key={i}
                  setHoveredCity={setHoveredCity}
                />
              ))
            : null}
        </ZoomableGroup>
      </ComposableMap>
      {[...sortedVisitedCities, ...sortedFutureCities, ...livedCities].map(
        (city, i) => (
          <MapTooltip
            city={city}
            isOpen={hoveredCity?.name === city.name}
            key={i}
            onMouseEnter={(city: City) => setHoveredCity(city)}
            onMouseLeave={() => setHoveredCity(null)}
          />
        )
      )}
    </div>
  );
});
