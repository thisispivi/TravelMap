import "./Map.scss";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const HOVER_LEAVE_DELAY_MS = 150;
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";

import { worldDataUrl } from "@/assets/worldData";
import { City } from "@/core";
import {
  futureCities,
  livedCities,
  visitedCities,
  visitedCountries,
} from "@/data";
import { computeVisibleLabels } from "@/utils/labelVisibility";
import { parameters } from "@/utils/parameters";

import { Loading, Marker } from "../../atoms";
import { HomeContext } from "../../pages/Home/HomeContext";
import { MapTooltip } from "../Tooltip/TooltipMap";

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

const DEFAULT_COUNTRY_FILL_DARK = "#1e1e2a";
const DEFAULT_COUNTRY_FILL_LIGHT = "#d4d8e0";

const GEO_STYLE = {
  default: { outline: "none" },
  hover: { outline: "none" },
  pressed: { outline: "none" },
} as const;

const PROJECTION_CONFIG = { scale: 160 } as const;

/** Duration of the fly-to animation in ms. */
const FLY_TO_DURATION_MS = 800;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

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
    isAutoPosition,
  } = context!;

  const [isLoaded, setIsLoaded] = useState(false);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [displayedPosition, setDisplayedPosition] = useState(mapPosition);
  const animFrameRef = useRef<number | null>(null);
  const isFromMoveEndRef = useRef(false);
  const currentPosRef = useRef(mapPosition);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (isFromMoveEndRef.current || !isAutoPosition) {
      isFromMoveEndRef.current = false;
      currentPosRef.current = mapPosition;
      animFrameRef.current = requestAnimationFrame(() => {
        animFrameRef.current = null;
        setDisplayedPosition(mapPosition);
      });
      return;
    }

    const start = { ...currentPosRef.current };
    const target = mapPosition;
    const startTime = performance.now();

    const animate = (now: number) => {
      const t = Math.min((now - startTime) / FLY_TO_DURATION_MS, 1);
      const e = easeInOutCubic(t);

      const current = {
        center: [
          start.center[0] + (target.center[0] - start.center[0]) * e,
          start.center[1] + (target.center[1] - start.center[1]) * e,
        ] as [number, number],
        zoom: start.zoom + (target.zoom - start.zoom) * e,
      };

      setDisplayedPosition(current);
      currentPosRef.current = current;

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        animFrameRef.current = null;
        currentPosRef.current = target;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [mapPosition, isAutoPosition]);

  const handleSetHoveredCity = useCallback(
    (city: City | null) => {
      if (hoverLeaveTimer.current) {
        clearTimeout(hoverLeaveTimer.current);
        hoverLeaveTimer.current = null;
      }
      if (city === null) {
        hoverLeaveTimer.current = setTimeout(
          () => setHoveredCity(null),
          HOVER_LEAVE_DELAY_MS,
        );
      } else {
        setHoveredCity(city);
      }
    },
    [setHoveredCity],
  );

  useEffect(() => {
    return () => {
      if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!hoveredCity) return;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as Element;
      if (
        !target.closest(".rsm-marker") &&
        !target.closest("#map-tooltip") &&
        !target.closest(".map-tooltip__container")
      ) {
        setHoveredCity(null);
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    return () => document.removeEventListener("touchstart", handleTouchStart);
  }, [hoveredCity, setHoveredCity]);

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

  const sortedVisitedCities = useMemo(
    () => [...visitedCities].sort(sortByLatitudeAndLongitude),
    [],
  );

  const sortedFutureCities = useMemo(
    () => [...futureCities].sort(sortByLatitudeAndLongitude),
    [],
  );

  const sortedLivedCities = useMemo(
    () => [...livedCities].sort(sortByLatitudeAndLongitude),
    [],
  );

  const allCities = useMemo(
    () => [...visitedCities, ...futureCities, ...livedCities],
    [],
  );

  const visibleLabels = useMemo(
    () => computeVisibleLabels(allCities, mapPosition.zoom, hoveredCity?.name),
    [allCities, mapPosition.zoom, hoveredCity?.name],
  );

  const handleWorldLoaded = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleMoveEnd = useCallback(
    (position: { coordinates: [number, number]; zoom: number }) => {
      isFromMoveEndRef.current = true;
      const pos = {
        center: position.coordinates,
        zoom: position.zoom,
      };
      currentPosRef.current = pos;
      setMapPosition(pos);
    },
    [setMapPosition],
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
          center={displayedPosition.center}
          maxZoom={parameters.map.defaultMaxZoom}
          minZoom={parameters.map.defaultMinZoom}
          onMoveEnd={handleMoveEnd}
          zoom={displayedPosition.zoom}
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
              {sortedVisitedCities.map((city) => (
                <Marker
                  city={city}
                  hoveredCity={hoveredCity}
                  key={city.name}
                  setHoveredCity={handleSetHoveredCity}
                  showLabel={visibleLabels.has(city.name)}
                />
              ))}
              {sortedFutureCities.map((city) => (
                <Marker
                  city={city}
                  hoveredCity={hoveredCity}
                  isFuture
                  key={city.name}
                  setHoveredCity={handleSetHoveredCity}
                  showLabel={visibleLabels.has(city.name)}
                />
              ))}
              {sortedLivedCities.map((city) => (
                <Marker
                  city={city}
                  hoveredCity={hoveredCity}
                  isLived
                  key={city.name}
                  setHoveredCity={handleSetHoveredCity}
                  showLabel={visibleLabels.has(city.name)}
                />
              ))}
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
            onMouseEnter={(city: City) => handleSetHoveredCity(city)}
            onMouseLeave={() => handleSetHoveredCity(null)}
            setIsOpen={(open: boolean) =>
              open
                ? handleSetHoveredCity(hoveredCity)
                : handleSetHoveredCity(null)
            }
          />
        ) : null}
      </Tooltip>
    </div>
  );
}
