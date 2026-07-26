import "./Map.scss";
import "maplibre-gl/dist/maplibre-gl.css";

import { ReactNode, use, useEffect, useMemo, useRef, useState } from "react";
import MapGL, { type MapRef, Popup } from "react-map-gl/maplibre";

import { City } from "@/core";
import { futureCities, livedCities, visitedCities } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { useLocation } from "@/hooks/location/location";

import { Button } from "../../atoms/Buttons/Button";
import { Loading } from "../../atoms/Loading/Loading";
import { HomeContext } from "../../pages/Home/HomeContext";
import { RouteOverlay } from "../RouteOverlay/RouteOverlay";
import { MapTooltip } from "../Tooltip/TooltipMap";
import {
  CAMERA_DURATION_MS,
  getCameraPadding,
  getTripBounds,
  MAP_MAX_BOUNDS,
  MAPLIBRE_MAX_ZOOM,
  MAPLIBRE_MIN_ZOOM,
  SINGLE_DESTINATION_ZOOM,
  toMapLibreZoom,
} from "./mapCamera";
import { MapLayers } from "./MapLayers";
import { MapMarkers } from "./MapMarkers";
import { createMapStyle, MAP_THEMES } from "./mapTheme";
import { getTripLayoverCities } from "./mapTripCities";

const HOVER_LEAVE_DELAY_MS = 300;
const TOOLTIP_OFFSET_PX = 14;
const ZOOM_CONTROL_DURATION_MS = 300;

/**
 * Map component
 * Coordinates the interactive map camera, marker selection, route overlay,
 * themed geographic layers, and selected-city tooltip.
 * @component
 * @returns {ReactNode} The interactive travel map
 */
export function Map(): ReactNode {
  const { t } = useLanguage(["home"]);
  const {
    isDarkTheme,
    hoveredCity,
    setHoveredCity,
    mapPosition,
    selectedTrip,
    isPanelOpen,
    responsive,
  } = use(HomeContext)!;
  const { isTripDetail } = useLocation();
  const mapRef = useRef<MapRef>(null);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      padding: getCameraPadding(responsive.window.width, isPanelOpen),
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
        padding,
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
        onLoad={(event) => {
          try {
            event.target.setMaxBounds(MAP_MAX_BOUNDS);
          } catch (error) {
            console.error("Map.setMaxBounds failed", error);
          }
          setIsLoaded(true);
        }}
        ref={mapRef}
        renderWorldCopies={false}
        touchPitch={false}
      >
        <MapLayers theme={theme} />
        <RouteOverlay />

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
          onClick={() =>
            mapRef.current?.zoomOut({ duration: ZOOM_CONTROL_DURATION_MS })
          }
        >
          −
        </Button>
      </div>
    </div>
  );
}
