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
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loading, Marker } from "../../atoms";
import { MapTooltip } from "../Tooltip/TooltipMap";
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

const DEFAULT_COUNTRY_FILL_DARK = "#1a1a1a";
const DEFAULT_COUNTRY_FILL_LIGHT = "#dadada";

const GEO_STYLE = {
  default: { outline: "none" },
  hover: { outline: "none" },
  pressed: { outline: "none" },
} as const;

const PROJECTION_CONFIG = { scale: 160 } as const;

function GeographyLayer({
  geographies,
  getCountryFillColor,
  onLoaded,
}: {
  geographies: Array<{ properties: { name: string }; rsmKey: string }>;
  getCountryFillColor: (countryId: string) => string;
  onLoaded: () => void;
}) {
  const didNotifyLoadedRef = useRef(false);

  useEffect(() => {
    if (!didNotifyLoadedRef.current && geographies.length > 0) {
      didNotifyLoadedRef.current = true;
      onLoaded();
    }
  }, [geographies.length, onLoaded]);

  return (
    <>
      {geographies.map((geo) => (
        <Geography
          fill={getCountryFillColor(geo.properties.name)}
          geography={geo}
          key={geo.rsmKey}
          strokeWidth={0}
          style={GEO_STYLE}
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
export function Map() {
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

  const visitedCountryFill = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        visitedCountries.map(
          (country) => [country.id, country.fillColor] as const,
        ),
      ),
    [],
  );

  const getCountryFillColor = useCallback(
    (countryId: string) =>
      visitedCountryFill[countryId] ??
      (isDarkTheme ? DEFAULT_COUNTRY_FILL_DARK : DEFAULT_COUNTRY_FILL_LIGHT),
    [isDarkTheme, visitedCountryFill],
  );

  const sortedVisitedCities = [...visitedCities].sort(
    sortByLatitudeAndLongitude,
  );

  const sortedFutureCities = [...futureCities].sort(sortByLatitudeAndLongitude);

  const sortedLivedCities = [...livedCities].sort(sortByLatitudeAndLongitude);

  const handleWorldLoaded = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleMoveEnd = useCallback(
    (position: { coordinates: [number, number]; zoom: number }) => {
      setMapPosition({
        center: position.coordinates,
        zoom: position.zoom,
      });
    },
    [setMapPosition],
  );

  const renderMarkers = useCallback(
    (cities: City[], flags?: { isFuture?: boolean; isLived?: boolean }) =>
      cities.map((city) => (
        <Marker
          city={city}
          hoveredCity={hoveredCity}
          key={city.name}
          setHoveredCity={setHoveredCity}
          {...flags}
        />
      )),
    [hoveredCity, setHoveredCity],
  );

  const tooltipAnchorSelect = useMemo(() => {
    if (!hoveredCity) return "";
    return `#${CSS.escape(`${hoveredCity.name}-marker`)}`;
  }, [hoveredCity]);

  const windowProps = responsive.window;

  return (
    <div className="map-container" style={windowProps}>
      {!isLoaded ? (
        <div className="loading" style={windowProps}>
          <Loading />
        </div>
      ) : null}

      <ComposableMap
        className="map"
        data-tip=""
        projection="geoMercator"
        projectionConfig={PROJECTION_CONFIG}
        {...windowProps}
      >
        <ZoomableGroup
          center={mapPosition.center}
          maxZoom={parameters.map.defaultMaxZoom}
          minZoom={parameters.map.defaultMinZoom}
          onMoveEnd={handleMoveEnd}
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

          {isLoaded ? (
            <>
              {renderMarkers(sortedVisitedCities)}
              {renderMarkers(sortedFutureCities, { isFuture: true })}
              {renderMarkers(sortedLivedCities, { isLived: true })}
            </>
          ) : null}
        </ZoomableGroup>
      </ComposableMap>

      <Tooltip
        anchorSelect={tooltipAnchorSelect}
        clickable
        id="map-tooltip"
        isOpen={!!hoveredCity}
        noArrow
        opacity={1}
        variant="light"
      >
        {hoveredCity ? (
          <MapTooltip
            city={hoveredCity}
            onMouseEnter={(city: City) => setHoveredCity(city)}
            onMouseLeave={() => setHoveredCity(null)}
            setIsOpen={(open: boolean) =>
              open ? setHoveredCity(hoveredCity) : setHoveredCity(null)
            }
          />
        ) : null}
      </Tooltip>
    </div>
  );
}
