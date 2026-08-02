import "./Map.scss";
import "maplibre-gl/dist/maplibre-gl.css";

import { City } from "@travelmap/core";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import MapGL, { type MapRef, Popup } from "react-map-gl/maplibre";

import { futureCities, livedCities, visitedCities } from "@/data/world";
import { Button } from "@/shared/components/Button/Button";
import { Loading } from "@/shared/components/Loading/Loading";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { usePanel } from "@/shared/context/Panel.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { ResponsiveType } from "@/shared/hooks/useResponsive";

import {
  CAMERA_DURATION_MS,
  getCameraOffset,
  getCameraPadding,
  getTripBounds,
  MAPLIBRE_MAX_ZOOM,
  MAPLIBRE_MIN_ZOOM,
  SINGLE_DESTINATION_ZOOM,
  toMapLibreZoom,
  WORLD_CENTER,
} from "../../lib/mapCamera";
import { createMapStyle, MAP_THEMES } from "../../lib/mapTheme";
import { getTripLayoverCities } from "../../lib/mapTripCities";
import { MapTooltip } from "../MapTooltip/MapTooltip";
import { RouteOverlay } from "../RouteOverlay/RouteOverlay";
import { MapLayers } from "./MapLayers";
import { MapMarkers } from "./MapMarkers";

const HOVER_LEAVE_DELAY_MS = 300;
const MAP_TILE_SIZE_PX = 512;
const MIN_ZOOM_EPSILON = 0.01;
const TOOLTIP_OFFSET_PX = 14;
const ZOOM_CONTROL_DURATION_MS = 300;

/**
 * Properties accepted by the interactive map.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {ResponsiveType} responsive - The current responsive viewport state
 */
interface MapProps {
  isDarkTheme: boolean;
  responsive: ResponsiveType;
}

/**
 * Map component
 * Coordinates the interactive map camera, marker selection, route overlay,
 * themed geographic layers, and selected-city tooltip.
 * @component
 * @param {MapProps} props - The map props
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {ResponsiveType} props.responsive - The current responsive viewport state
 * @returns {ReactNode} The interactive travel map
 */
export function Map({ isDarkTheme, responsive }: MapProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const { hoveredCity, setHoveredCity, mapPosition, selectedTrip } =
    useMapInteraction();
  const { isPanelOpen } = usePanel();
  const { isTripDetail } = useAppRoute();
  const mapRef = useRef<MapRef>(null);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFramingWorld = useRef(false);
  const pinnedCityRef = useRef<City | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const theme = MAP_THEMES[isDarkTheme ? "dark" : "light"];
  const mapStyle = useMemo(() => createMapStyle(theme), [theme]);
  const appliedPosition = useRef(mapPosition);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded || appliedPosition.current === mapPosition) return;

    appliedPosition.current = mapPosition;
    map.flyTo({
      center: mapPosition.center,
      zoom: toMapLibreZoom(mapPosition.zoom),
      offset: getCameraOffset(responsive.window.width, isPanelOpen),
      duration: CAMERA_DURATION_MS,
      essential: true,
    });
  }, [isLoaded, isPanelOpen, mapPosition, responsive.window.width]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded || !isTripDetail || !selectedTrip) return;

    const padding = getCameraPadding(responsive.window.width, isPanelOpen);

    if (selectedTrip.mapFocus) {
      map.flyTo({
        center: selectedTrip.mapFocus.center,
        zoom: toMapLibreZoom(selectedTrip.mapFocus.zoom),
        duration: CAMERA_DURATION_MS,
        essential: true,
        offset: getCameraOffset(responsive.window.width, isPanelOpen),
      });
      return;
    }

    const bounds = getTripBounds(selectedTrip);
    if (!bounds) return;

    map.fitBounds(bounds, {
      duration: CAMERA_DURATION_MS,
      essential: true,
      maxZoom: SINGLE_DESTINATION_ZOOM,
      padding,
    });
  }, [
    isLoaded,
    isPanelOpen,
    isTripDetail,
    responsive.window.width,
    selectedTrip,
  ]);

  /**
   * Clears both the pinned and transient tooltip selection.
   * @returns {void}
   */
  const closeTooltip = (): void => {
    pinnedCityRef.current = null;
    setHoveredCity(null);
  };

  useEffect(() => {
    /**
     * Closes the pinned tooltip when the user presses Escape.
     * @param {KeyboardEvent} event - The window keyboard event
     * @returns {void}
     */
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      pinnedCityRef.current = null;
      setHoveredCity(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [setHoveredCity]);

  /**
   * Updates transient marker highlighting without overriding a pinned marker.
   * @param {City | null} city - The city entering or leaving hover
   * @returns {void}
   */
  const handleHoverCity = (city: City | null): void => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);

    if (city) {
      if (pinnedCityRef.current?.name !== city.name) {
        pinnedCityRef.current = null;
      }
      setHoveredCity(city);
      return;
    }

    hoverLeaveTimer.current = setTimeout(() => {
      if (!pinnedCityRef.current) setHoveredCity(null);
    }, HOVER_LEAVE_DELAY_MS);
  };

  /**
   * Pins a selected city or closes it when the same marker is selected again.
   * @param {City} city - The selected city
   * @returns {void}
   */
  const handleSelectCity = (city: City): void => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);

    const shouldClose = pinnedCityRef.current?.name === city.name;
    pinnedCityRef.current = shouldClose ? null : city;
    setHoveredCity(shouldClose ? null : city);
  };

  /**
   * Centers the complete world in the map area not covered by the panel.
   * @param {MapRef} map - The active MapLibre map
   * @param {number} zoom - The viewport-constrained minimum zoom
   * @returns {void}
   */
  const frameWorld = (map: MapRef, zoom: number): void => {
    isFramingWorld.current = true;
    map.easeTo({
      center: WORLD_CENTER,
      duration: ZOOM_CONTROL_DURATION_MS,
      essential: true,
      offset: getCameraOffset(responsive.window.width, isPanelOpen),
      zoom,
    });
  };

  /**
   * Zooms out one level or frames the complete world when the next zoom step
   * would reach MapLibre's viewport-constrained minimum zoom.
   * @returns {void}
   */
  const handleZoomOut = (): void => {
    const map = mapRef.current;
    if (!map) return;

    const viewportMinZoom = Math.max(
      MAPLIBRE_MIN_ZOOM,
      Math.log2(map.getCanvas().clientHeight / MAP_TILE_SIZE_PX),
    );

    if (map.getZoom() - 1 > viewportMinZoom) {
      map.zoomOut({ duration: ZOOM_CONTROL_DURATION_MS });
      return;
    }

    frameWorld(map, viewportMinZoom);
  };

  /**
   * Applies the same complete-world framing after trackpad or mouse-wheel zoom.
   * @returns {void}
   */
  const handleZoomEnd = (): void => {
    if (isFramingWorld.current) {
      isFramingWorld.current = false;
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    const viewportMinZoom = Math.max(
      MAPLIBRE_MIN_ZOOM,
      Math.log2(map.getCanvas().clientHeight / MAP_TILE_SIZE_PX),
    );

    if (map.getZoom() > viewportMinZoom + MIN_ZOOM_EPSILON) return;

    frameWorld(map, viewportMinZoom);
  };

  const layoverCities =
    isTripDetail && selectedTrip
      ? getTripLayoverCities(selectedTrip, [
          ...visitedCities,
          ...futureCities,
          ...livedCities,
        ])
      : [];

  return (
    <div className="map-container">
      {!isLoaded ? (
        <div className="loading">
          <Loading />
        </div>
      ) : null}

      <MapGL
        attributionControl={false}
        dragRotate={false}
        initialViewState={{
          longitude: mapPosition.center[0],
          latitude: mapPosition.center[1],
          zoom: toMapLibreZoom(mapPosition.zoom),
        }}
        mapStyle={mapStyle}
        maxPitch={0}
        maxZoom={MAPLIBRE_MAX_ZOOM}
        minPitch={0}
        minZoom={MAPLIBRE_MIN_ZOOM}
        onClick={closeTooltip}
        onLoad={() => setIsLoaded(true)}
        onZoomEnd={handleZoomEnd}
        ref={mapRef}
        renderWorldCopies={false}
        touchPitch={false}
      >
        <MapLayers theme={theme} />
        <RouteOverlay isDarkTheme={isDarkTheme} />

        {isLoaded ? (
          <MapMarkers
            hoveredCity={hoveredCity}
            layoverCities={layoverCities}
            onHoverCity={handleHoverCity}
            onSelectCity={handleSelectCity}
          />
        ) : null}

        {hoveredCity ? (
          <Popup
            className="map-tooltip"
            closeButton={false}
            closeOnClick={false}
            latitude={hoveredCity.coordinates[1]}
            longitude={hoveredCity.coordinates[0]}
            maxWidth="none"
            offset={TOOLTIP_OFFSET_PX}
            onClose={closeTooltip}
          >
            <MapTooltip
              city={hoveredCity}
              onClose={closeTooltip}
              onHoverCity={handleHoverCity}
            />
          </Popup>
        ) : null}
      </MapGL>

      <div className="map-zoom-controls">
        <Button
          ariaLabel={t("map.zoomIn")}
          className="map-zoom-controls__button"
          onClick={() =>
            mapRef.current?.zoomIn({ duration: ZOOM_CONTROL_DURATION_MS })
          }
        >
          +
        </Button>
        <Button
          ariaLabel={t("map.zoomOut")}
          className="map-zoom-controls__button"
          onClick={handleZoomOut}
        >
          −
        </Button>
      </div>
    </div>
  );
}
