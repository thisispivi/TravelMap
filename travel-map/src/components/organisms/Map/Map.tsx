import "./Map.scss";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { City, Country as CountryCore } from "@/core";
import { HomeContext } from "../../pages/Home/Home";
import { JSX, useContext, useState } from "react";
import { Loading, Marker } from "../../atoms";
import { MapTooltip } from "..";
import { Tooltip } from "react-tooltip";
import { parameters } from "@/utils/parameters";
import { worldData } from "@/assets";

export interface MapProps {
  livedCities: City[];
  visitedCountries: CountryCore[];
  visitedCities: City[];
  futureCities: City[];
  currHoveredCity: City | null;
  setCurrentHoveredCity: (city: City | null) => void;
}

/**
 * The map component
 *
 * The map component is used to create a map.
 *
 * @component
 *
 * @param {MapProps} props - The props of the component
 * @param {City[]} props.livedCities - The cities where the user lived
 * @param {Country[]} props.visitedCountries - The visited countries
 * @param {City[]} props.visitedCities - The visited cities
 * @param {City[]} props.futureCities - The future cities
 * @param {City | null} props.currHoveredCity - The current hovered city
 * @param {function} props.setCurrentHoveredCity - The function to set the current hovered city
 * @returns {JSX.Element} - The map
 */
export default function Map({
  visitedCountries,
  visitedCities,
  futureCities,
  livedCities,
}: MapProps): JSX.Element {
  const context = useContext(HomeContext);
  const {
    isDarkTheme,
    hoveredCity,
    setHoveredCity,
    mapPosition,
    responsive,
    setMapPosition,
  } = context!;

  const [isLoaded, setIsLoaded] = useState(false);

  const getCountryFillColor = (country: string) => {
    const visitedCountry = visitedCountries.find((c) => c.id === country);
    if (visitedCountry) return visitedCountry.fillColor;
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
        projectionConfig={{ scale: 160 }}
        {...responsive.window}
      >
        <ZoomableGroup
          center={mapPosition.center}
          maxZoom={parameters.map.defaultMaxZoom}
          minZoom={parameters.map.defaultMinZoom}
          onMoveEnd={(position) =>
            setMapPosition({
              center: position.coordinates,
              zoom: position.zoom,
            })
          }
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
      <Tooltip
        anchorSelect={`#${hoveredCity?.name}-marker`}
        clickable
        id="map-tooltip"
        isOpen={hoveredCity !== null}
        noArrow
        opacity={1}
        variant="light"
      >
        {hoveredCity ? (
          <MapTooltip
            city={hoveredCity}
            onMouseEnter={(city: City) => setHoveredCity(city)}
            onMouseLeave={() => setHoveredCity(null)}
            setIsOpen={(isOpen: boolean) =>
              isOpen ? setHoveredCity(hoveredCity) : setHoveredCity(null)
            }
          />
        ) : null}
      </Tooltip>
    </div>
  );
}
