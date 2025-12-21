import "./Map.scss";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { City } from "@/core";
import { HomeContext } from "../../pages/Home/Home";
import {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Loading, Marker } from "../../atoms";
import MapTooltip from "../Tooltip/TooltipMap";
import { Tooltip } from "react-tooltip";
import { parameters } from "@/utils/parameters";
import { worldDataUrl } from "@/assets/worldData";
import {
  futureCities,
  livedCities,
  visitedCities,
  visitedCountries,
} from "@/data";

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

function GeographyLayer({
  geographies,
  getCountryFillColor,
  onLoaded,
}: {
  geographies: Array<{ properties: { name: string }; rsmKey: string }>;
  getCountryFillColor: (countryId: string) => string;
  onLoaded: () => void;
}): JSX.Element {
  useEffect(() => {
    if (geographies.length > 0) onLoaded();
  }, [geographies.length, onLoaded]);

  return (
    <>
      {geographies.map((geo) => (
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
      ))}
    </>
  );
}

/**
 * Interactive world map.
 *
 * Data is imported from `@/data` so it can be code-split together with the
 * lazy-loaded map chunk.
 */
export default function Map(): JSX.Element {
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

  const visitedCountryFill = useMemo(() => {
    return new globalThis.Map<string, string>(
      visitedCountries.map((country) => [country.id, country.fillColor]),
    );
  }, []);

  const getCountryFillColor = useCallback(
    (countryId: string) => {
      const fill = visitedCountryFill.get(countryId);
      if (fill) return fill;
      return isDarkTheme ? "#1a1a1a" : "#dadada";
    },
    [isDarkTheme, visitedCountryFill],
  );

  const sortedVisitedCities = useMemo(() => {
    return [...visitedCities].sort(sortByLatitudeAndLongitude);
  }, []);

  const sortedFutureCities = useMemo(() => {
    return [...futureCities].sort(sortByLatitudeAndLongitude);
  }, []);

  const handleWorldLoaded = useCallback(() => {
    setIsLoaded(true);
  }, []);

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
          <Geographies geography={worldDataUrl}>
            {({ geographies }) =>
              geographies.length > 0 ? (
                <GeographyLayer
                  geographies={geographies}
                  getCountryFillColor={getCountryFillColor}
                  onLoaded={handleWorldLoaded}
                />
              ) : null
            }
          </Geographies>
          {isLoaded
            ? sortedVisitedCities.map((city) => (
                <Marker
                  city={city}
                  hoveredCity={hoveredCity}
                  key={city.name}
                  setHoveredCity={setHoveredCity}
                />
              ))
            : null}
          {isLoaded
            ? sortedFutureCities.map((city) => (
                <Marker
                  city={city}
                  hoveredCity={hoveredCity}
                  isFuture
                  key={city.name}
                  setHoveredCity={setHoveredCity}
                />
              ))
            : null}
          {isLoaded
            ? livedCities.map((city) => (
                <Marker
                  city={city}
                  hoveredCity={hoveredCity}
                  isLived
                  key={city.name}
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
