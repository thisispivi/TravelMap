import { memo, useContext, useEffect, useRef, useState } from "react";
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

export interface MapProps {
  visitedCountries: Record<string, CountryCore>;
  visitedCities: City[];
  futureCities: City[];
  currHoveredCity: City | null;
  setCurrentHoveredCity: (city: City | null) => void;
}

export default memo(function MapA({
  visitedCountries,
  visitedCities,
}: MapProps): JSX.Element {
  const context = useContext(HomeContext);
  const { isDarkTheme, hoveredCity, setHoveredCity } = context!;
  const [, setWindowWidth] = useState(window.innerWidth);
  const handleResize = () => setWindowWidth(window.innerWidth);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [worldData, setWorldData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!worldData) {
      fetch(
        "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json"
      ).then((response) => {
        response.json().then((data) => {
          setWorldData(data);
          setIsLoading(false);
        });
      });
    }
  }, [worldData]);

  const nLoaded = useRef(0);

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
      {isLoading || !worldData || nLoaded.current < 240 ? (
        <div
          className="loading"
          style={{ height: window.innerHeight, width: window.innerWidth }}
        >
          <Loading />
        </div>
      ) : null}
      <ComposableMap
        className="map"
        projection={"geoMercator"}
        width={window.innerWidth}
        height={window.innerHeight}
      >
        <ZoomableGroup maxZoom={30} minZoom={1} zoom={5} center={[7, 49]}>
          <Geographies geography={worldData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                nLoaded.current += 1;
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
          {nLoaded.current > 240 &&
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
    </div>
  );
});
