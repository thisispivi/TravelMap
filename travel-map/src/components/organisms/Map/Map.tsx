import { memo, useContext, useEffect, useState } from "react";
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
}: MapProps): JSX.Element {
  const context = useContext(HomeContext);
  const { isDarkTheme, hoveredCity, setHoveredCity, mapPosition } = context!;
  const [, setWindowWidth] = useState(window.innerWidth);
  const handleResize = () => setWindowWidth(window.innerWidth);

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
    <div
      className="map-container"
      style={{ height: window.innerHeight, width: window.innerWidth }}
    >
      {!isLoaded && (
        <div
          className="loading"
          style={{ height: window.innerHeight, width: window.innerWidth }}
        >
          <Loading />
        </div>
      )}
      <ComposableMap
        className="map"
        projection={"geoMercator"}
        width={window.innerWidth}
        height={window.innerHeight}
        data-tip=""
      >
        <ZoomableGroup
          maxZoom={parameters.map.defaultMaxZoom}
          minZoom={parameters.map.defaultMinZoom}
          zoom={mapPosition.zoom}
          center={mapPosition.center}
        >
          <Geographies geography={worldData}>
            {({ geographies }) =>
              geographies.map((geo, i) => {
                if (i === geographies.length - 1) setIsLoaded(true);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    strokeWidth={0}
                    fill={getCountryFillColor(geo.properties.name)}
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
          {isLoaded &&
            sortedVisitedCities.map((city, i) => (
              <Marker
                key={i}
                city={city}
                hoveredCity={hoveredCity}
                setHoveredCity={setHoveredCity}
              />
            ))}
          {isLoaded &&
            sortedFutureCities.map((city, i) => (
              <Marker
                key={i}
                city={city}
                hoveredCity={hoveredCity}
                setHoveredCity={setHoveredCity}
                isFuture
              />
            ))}
        </ZoomableGroup>
      </ComposableMap>
      {[...sortedVisitedCities, ...sortedFutureCities].map((city, i) => (
        <MapTooltip
          key={i}
          city={city}
          onMouseEnter={(city: City) => setHoveredCity(city)}
          onMouseLeave={() => setHoveredCity(null)}
          isOpen={hoveredCity?.name === city.name}
        />
      ))}
    </div>
  );
});
