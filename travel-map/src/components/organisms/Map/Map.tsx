import "./Map.scss";

import { use, useEffect, useRef, useState } from "react";
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
import { useLocation } from "@/hooks/location/location";
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
  geographies: Array<{
    properties: {
      name: string;
    };
    rsmKey: string;
  }>;
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
 * @returns {ReactNode} SVG geography shapes
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

interface MapMarkersProps {
  hoveredCity: City | null;
  sortedVisitedCities: City[];
  sortedFutureCities: City[];
  sortedLivedCities: City[];
  tripLayoverCities: City[];
  visibleLabels: Set<string>;
  onHoverCity: (city: City | null) => void;
}

function MapMarkers({
  hoveredCity,
  sortedVisitedCities,
  sortedFutureCities,
  sortedLivedCities,
  tripLayoverCities,
  visibleLabels,
  onHoverCity,
}: MapMarkersProps) {
  return (
    <>
      {sortedVisitedCities.map((city) => (
        <Marker
          city={city}
          hoveredCity={hoveredCity}
          key={city.name}
          setHoveredCity={onHoverCity}
          showLabel={visibleLabels.has(city.name)}
        />
      ))}
      {sortedFutureCities.map((city) => (
        <Marker
          city={city}
          hoveredCity={hoveredCity}
          key={city.name}
          setHoveredCity={onHoverCity}
          showLabel={visibleLabels.has(city.name)}
          variant="future"
        />
      ))}
      {sortedLivedCities.map((city) => (
        <Marker
          city={city}
          hoveredCity={hoveredCity}
          key={city.name}
          setHoveredCity={onHoverCity}
          showLabel={visibleLabels.has(city.name)}
          variant="lived"
        />
      ))}
      {tripLayoverCities.map((city) => (
        <Marker
          city={city}
          hoveredCity={hoveredCity}
          key={`layover-${city.name}`}
          setHoveredCity={onHoverCity}
          showLabel={visibleLabels.has(city.name)}
          variant="layover"
        />
      ))}
    </>
  );
}

interface MapTooltipOverlayProps {
  hoveredCity: City | null;
  onHoverCity: (city: City | null) => void;
}

function MapTooltipOverlay({
  hoveredCity,
  onHoverCity,
}: MapTooltipOverlayProps) {
  const tooltipAnchorSelect = hoveredCity
    ? `#${CSS.escape(`${hoveredCity.name}-marker`)}`
    : "";

  return (
    <Tooltip
      anchorSelect={tooltipAnchorSelect}
      clickable
      id="map-tooltip"
      isOpen={!!hoveredCity}
      key={hoveredCity?.name ?? "none"}
      noArrow
      opacity={1}
      variant="light"
    >
      {hoveredCity ? (
        <MapTooltip
          city={hoveredCity}
          onMouseEnter={(city: City) => onHoverCity(city)}
          onMouseLeave={() => onHoverCity(null)}
          setIsOpen={(open: boolean) =>
            open ? onHoverCity(hoveredCity) : onHoverCity(null)
          }
        />
      ) : null}
    </Tooltip>
  );
}

interface MapZoomControlsProps {
  zoomInLabel: string;
  zoomOutLabel: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

function MapZoomControls({
  zoomInLabel,
  zoomOutLabel,
  onZoomIn,
  onZoomOut,
}: MapZoomControlsProps) {
  return (
    <div className="map-zoom-controls">
      <Button
        ariaLabel={zoomInLabel}
        className="map-zoom-controls__button"
        onClick={onZoomIn}
      >
        +
      </Button>
      <Button
        ariaLabel={zoomOutLabel}
        className="map-zoom-controls__button"
        onClick={onZoomOut}
      >
        -
      </Button>
    </div>
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
 * @returns {ReactNode} The full-screen map canvas
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
    selectedTrip,
  } = context!;
  const { isTripDetail } = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<{
    time: number;
    x: number;
    y: number;
  } | null>(null);
  const [displayedPosition, setDisplayedPosition] = useState(mapPosition);
  const animFrameRef = useRef<number | null>(null);
  const isFromMoveEndRef = useRef(false);
  const currentPosRef = useRef(mapPosition);
  useEffect(() => {
    let currentFrame: number | null = null;
    const scheduleFrame = (callback: FrameRequestCallback) => {
      currentFrame = requestAnimationFrame(callback);
      animFrameRef.current = currentFrame;
    };

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (isFromMoveEndRef.current) {
      isFromMoveEndRef.current = false;
      currentPosRef.current = mapPosition;
      scheduleFrame(() => {
        animFrameRef.current = null;
        setDisplayedPosition(mapPosition);
      });
      return () => {
        if (currentFrame !== null) cancelAnimationFrame(currentFrame);
      };
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
        scheduleFrame(animate);
      } else {
        animFrameRef.current = null;
        currentPosRef.current = target;
      }
    };
    scheduleFrame(animate);
    return () => {
      if (currentFrame !== null) cancelAnimationFrame(currentFrame);
    };
  }, [mapPosition]);
  const handleSetHoveredCity = (city: City | null) => {
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
  };
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
  const handleDoubleTap = (e: React.TouchEvent<HTMLDivElement>) => {
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
  };
  const handleZoomIn = () => {
    const cur = currentPosRef.current;
    setMapPosition({
      center: cur.center,
      zoom: Math.min(cur.zoom * 2, parameters.map.defaultMaxZoom),
    });
  };
  const handleZoomOut = () => {
    const cur = currentPosRef.current;
    setMapPosition({
      center: cur.center,
      zoom: Math.max(cur.zoom / 2, parameters.map.defaultMinZoom),
    });
  };
  const visitedCountryFill = Object.fromEntries(
    visitedCountries.map((country) => [country.id, country.fillColor] as const),
  ) as Record<string, string>;
  const getCountryFillColor = (countryId: string) =>
    visitedCountryFill[countryId] ??
    (isDarkTheme ? DEFAULT_COUNTRY_FILL_DARK : DEFAULT_COUNTRY_FILL_LIGHT);
  const sortedVisitedCities = visitedCities.toSorted(sortByCoordinates);
  const sortedFutureCities = futureCities.toSorted(sortByCoordinates);
  const sortedLivedCities = livedCities.toSorted(sortByCoordinates);
  const allCities = [...visitedCities, ...futureCities, ...livedCities];
  const tripLayoverCities = (() => {
    if (!isTripDetail || !selectedTrip) return [];
    const existing = new Set(allCities.map((c) => c.name));
    const seen = new Set<string>();
    const layovers: City[] = [];
    const add = (city?: City) => {
      if (!city || existing.has(city.name) || seen.has(city.name)) return;
      seen.add(city.name);
      layovers.push(city);
    };
    for (const destination of selectedTrip.destinations) {
      if (destination.isLayover) add(destination.city);
    }
    for (const step of selectedTrip.steps) {
      if (step.type !== "transport") continue;
      add(step.from);
      add(step.to);
      for (const via of step.via ?? step.ferry?.via ?? []) add(via);
    }
    add(selectedTrip.origin?.city);
    add(selectedTrip.returnTo?.city);
    return layovers;
  })();
  const visibleLabels = computeVisibleLabels(
    [...allCities, ...tripLayoverCities],
    mapPosition.zoom,
    hoveredCity?.name,
  );
  const handleWorldLoaded = () => {
    setIsLoaded(true);
  };
  const handleMoveEnd = (position: {
    coordinates: [number, number];
    zoom: number;
  }) => {
    isFromMoveEndRef.current = true;
    const pos = {
      center: position.coordinates,
      zoom: position.zoom,
    };
    currentPosRef.current = pos;
    setMapPosition(pos);
  };
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

          <RouteOverlay />
          {isLoaded ? (
            <MapMarkers
              hoveredCity={hoveredCity}
              onHoverCity={handleSetHoveredCity}
              sortedFutureCities={sortedFutureCities}
              sortedLivedCities={sortedLivedCities}
              sortedVisitedCities={sortedVisitedCities}
              tripLayoverCities={tripLayoverCities}
              visibleLabels={visibleLabels}
            />
          ) : null}
        </ZoomableGroup>
      </ComposableMap>

      <MapTooltipOverlay
        hoveredCity={hoveredCity}
        onHoverCity={handleSetHoveredCity}
      />
      <MapZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        zoomInLabel={t("map.zoomIn")}
        zoomOutLabel={t("map.zoomOut")}
      />
    </div>
  );
}
