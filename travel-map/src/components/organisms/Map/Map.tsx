import { memo, useContext, useEffect, useState } from "react";
import { HomeContext } from "../../pages/Home/Home";
import { City, Country as CountryCore } from "../../../core";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { worldData } from "../../../assets";
import "./Map.scss";
import { Marker } from "../../atoms";

export interface MapProps {
  visitedCountries: Record<string, CountryCore>;
  visitedCities: City[];
  futureCities: City[];
  currHoveredCity: City | null;
  setCurrentHoveredCity: (city: City | null) => void;
}

/**
 * Map component
 *
 * The map component is used to display the map of the world. Uses three.js and react-three-fiber.
 * It displays the countries and the visited cities. It also handles the camera controls.
 * It uses the HomeContext to get the dark theme.
 *
 * @component
 *
 * @param {MapProps} props - The props of the component
 * @param {WorldFeatureCollection} props.data - The data of the map
 * @param {Record<string, CountryCore>} props.visitedCountries - The visited countries
 * @param {City[]} props.visitedCities - The visited cities
 * @param {City[]} props.futureCities - The future cities
 * @param {City | null} props.currHoveredCity - The current hovered city
 * @param {function} props.setCurrentHoveredCity - The function to set the current hovered city
 * @returns {JSX.Element} - The map
 */
export default memo(function Map({
  visitedCountries,
  visitedCities,
}: MapProps): JSX.Element {
  const context = useContext(HomeContext);
  const { isDarkTheme, hoveredCity, setHoveredCity } = context!;
  const [, setWindowWidth] = useState(window.innerWidth);
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };

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

  const [currentZoom, setCurrentZoom] = useState(
    window.innerWidth > 1000 ? 4 : 5
  );

  return (
    <ComposableMap
      className="map"
      projection={"geoMercator"}
      width={window.innerWidth}
      height={window.innerHeight}
    >
      <ZoomableGroup
        maxZoom={30}
        minZoom={1}
        zoom={window.innerWidth > 1000 ? 4 : 5}
        center={[7, 49]}
        onMoveEnd={(event) => {
          setCurrentZoom(event.zoom);
        }}
        onMove={(event) => {
          setCurrentZoom(event.zoom);
        }}
        onMoveStart={(event) => {
          setCurrentZoom(event.zoom);
        }}
      >
        <Geographies geography={worldData}>
          {({ geographies }) =>
            geographies.map((geo) => (
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
            ))
          }
        </Geographies>
        {visitedCities.map((city, i) => (
          <Marker
            key={i}
            city={city}
            hoveredCity={hoveredCity}
            setHoveredCity={setHoveredCity}
            currentZoom={currentZoom}
          />
        ))}
        {/* <use xlinkHref={hoveredCity?.name + "-marker"} /> */}
      </ZoomableGroup>
    </ComposableMap>
  );
});
