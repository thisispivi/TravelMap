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
      {!isLoaded && (
        <div className="loading" style={{ ...responsive.window }}>
          <Loading />
        </div>
      )}
      <ComposableMap
        className="map"
        projection={"geoMercator"}
        data-tip=""
        {...responsive.window}
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
            sortedFutureCities.map((city, i) => (
              <Marker
                key={i}
                city={city}
                hoveredCity={hoveredCity}
                setHoveredCity={setHoveredCity}
                isFuture
              />
            ))}
          {isLoaded &&
            sortedVisitedCities.map((city, i) => (
              <Marker
                key={i}
                city={city}
                hoveredCity={hoveredCity}
                setHoveredCity={setHoveredCity}
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
