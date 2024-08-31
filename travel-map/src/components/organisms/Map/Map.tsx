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
import Tooltip from "../Tooltip/Tooltip";

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
}: MapProps): JSX.Element {
  const context = useContext(HomeContext);
  const { isDarkTheme, hoveredCity, setHoveredCity, mapCenter, mapZoom } =
    context!;
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
    return isDarkTheme ? "#1a1a1a" : "#eaeaec";
  };

  const sortedCities = visitedCities.sort((a, b) => {
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
  });

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
          maxZoom={30}
          minZoom={1}
          zoom={mapZoom}
          center={mapCenter}
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
            sortedCities.map((city, i) => (
              <Marker
                key={i}
                city={city}
                hoveredCity={hoveredCity}
                setHoveredCity={setHoveredCity}
              />
            ))}
        </ZoomableGroup>
      </ComposableMap>
      {sortedCities.map((city, i) => (
        <Tooltip
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
