import "./Map.scss";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useLanguage } from "@/hooks/language/language";
import { computeVisibleLabels } from "@/utils/labelVisibility";
import { parameters } from "@/utils/parameters";

import { Button, Loading, Marker } from "../../atoms";
import { HomeContext } from "../../pages/Home/HomeContext";
import { RouteOverlay } from "../RouteOverlay/RouteOverlay";
import { MapTooltip } from "../Tooltip/TooltipMap";

const HOVER_LEAVE_DELAY_MS = 150;
const FLY_TO_DURATION_MS = 800;

const sortByCoordinates = (a: City, b: City) => {
  const [lonA, latA] = a.coordinates;
  const [lonB, latB] = b.coordinates;
  if (latA !== latB) return latA < latB ? 1 : -1;
  if (lonA !== lonB) return lonA < lonB ? -1 : 1;
  return 0;
};

const DEFAULT_COUNTRY_FILL_DARK = "#1e1e2a";
const DEFAULT_COUNTRY_FILL_LIGHT = "#d4d8e0";

const GEO_STYLE = {
  default: { outline: "none" },
  hover: { outline: "none" },
  pressed: { outline: "none" },
} as const;

const PROJECTION_CONFIG = { scale: 160 } as const;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface GeographyLayerProps {
  geographies: Array<{ properties: { name: string }; rsmKey: string }>;
  getCountryFillColor: (countryId: string) => string;
  onLoaded: () => void;
}

/**
 * GeographyLayer component
 *
 * Renders the world map's filled country shapes and fires `onLoaded` once
 * geographies have been received from the GeoJSON source.
 *
 * @component
 *
 * @param {GeographyLayerProps} props
 * @param {GeographyLayerProps["geographies"]} props.geographies - GeoJSON feature array
 * @param {(countryId: string) => string} props.getCountryFillColor - Returns the fill color for a given country name.
 * @param {() => void} props.onLoaded - Called once on the first non-empty render.
 * @returns {JSX.Element} SVG geography shapes
 */
function GeographyLayer({
  geographies,
  getCountryFillColor,
  onLoaded,
}: GeographyLayerProps) {
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
 * Map component
 *
 * Interactive world map rendered with react-simple-maps. Displays visited,
 * lived, and future city markers with animated fly-to transitions, city-name
 * labels, and a hover tooltip.
 *
 * @component
 *
 * @returns {JSX.Element} The full-screen map canvas
 */
export function Map() {
  const { t } = useLanguage(["home"]);
  const context = use(HomeContext);
  const {
    isDarkTheme,
    hoveredCity,
    setHoveredCity,
    mapPosition,
    responsive,
    setMapPosition,
  } = context!;

  const [isLoaded, setIsLoaded] = useState(false);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(
    null,
  );

  const [displayedPosition, setDisplayedPosition] = useState(mapPosition);
  const animFrameRef = useRef<number | null>(null);
  const isFromMoveEndRef = useRef(false);
  const currentPosRef = useRef(mapPosition);

  useEffect(() => {
    return () => {
      const frame = animFrameRef.current;
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (isFromMoveEndRef.current) {
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
  }, [mapPosition]);

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
      const timer = hoverLeaveTimer.current;
      if (timer) clearTimeout(timer);
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

  const handleDoubleTap = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (e.changedTouches.length !== 1) return;
      const touch = e.changedTouches[0];
      const now = Date.now();
      const last = lastTapRef.current;
      if (
        last &&
        now - last.time < 300 &&
        Math.abs(touch.clientX - last.x) < 30 &&
        Math.abs(touch.clientY - last.y) < 30
      ) {
        lastTapRef.current = null;
        const cur = currentPosRef.current;
        setMapPosition({
          center: cur.center,
          zoom: Math.min(cur.zoom * 2, parameters.map.defaultMaxZoom),
        });
      } else {
        lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
      }
    },
    [setMapPosition],
  );

  const handleZoomIn = useCallback(() => {
    const cur = currentPosRef.current;
    setMapPosition({
      center: cur.center,
      zoom: Math.min(cur.zoom * 2, parameters.map.defaultMaxZoom),
    });
  }, [setMapPosition]);

  const handleZoomOut = useCallback(() => {
    const cur = currentPosRef.current;
    setMapPosition({
      center: cur.center,
      zoom: Math.max(cur.zoom / 2, parameters.map.defaultMinZoom),
    });
  }, [setMapPosition]);

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
    () => visitedCities.toSorted(sortByCoordinates),
    [],
  );

  const sortedFutureCities = useMemo(
    () => futureCities.toSorted(sortByCoordinates),
    [],
  );

  const sortedLivedCities = useMemo(
    () => livedCities.toSorted(sortByCoordinates),
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
    <div
      className="map-container"
      onTouchEnd={handleDoubleTap}
      style={windowProps}
    >
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
          <RouteOverlay />
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
      <div className="map-zoom-controls">
        <Button
          ariaLabel={t("map.zoomIn")}
          className="map-zoom-controls__button"
          onClick={handleZoomIn}
        >
          +
        </Button>
        <Button
          ariaLabel={t("map.zoomOut")}
          className="map-zoom-controls__button"
          onClick={handleZoomOut}
        >
          -
        </Button>
      </div>
    </div>
  );
}
