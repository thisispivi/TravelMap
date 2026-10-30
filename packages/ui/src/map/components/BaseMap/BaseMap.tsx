import { ReactNode, RefObject, useMemo } from "react";
import MapGL, { MapProps, type MapRef } from "react-map-gl/maplibre";

import { createMapStyle, MapTheme } from "../../lib/mapTheme";
import { WorldLayers } from "../WorldLayers/WorldLayers";
import { ZoomControls } from "../ZoomControls/ZoomControls";

/* Quick enough to follow a run of presses without the map lagging behind. */
const ZOOM_DURATION_MS = 300;

/**
 * Properties accepted by the BaseMap component, besides MapLibre's own.
 * @property {MapTheme} theme - The active map theme
 * @property {RefObject<MapRef | null>} mapRef - The map, for the owner's camera moves
 * @property {ReactNode} children - The owner's layers, markers and popups
 * @property {unknown} [countryFill] - A colour expression for the countries
 * @property {boolean} [hasZoomControls] - Whether the plus and minus pill shows
 * @property {() => void} [onZoomOut] - Replaces the plain zoom-out step
 */
interface BaseMapProps extends Omit<MapProps, "mapStyle"> {
  theme: MapTheme;
  mapRef: RefObject<MapRef | null>;
  children: ReactNode;
  countryFill?: unknown;
  hasZoomControls?: boolean;
  onZoomOut?: () => void;
}

/**
 * BaseMap component
 * The flat world map both apps draw on: MapLibre styled from the theme, never
 * tilted or rotated, the countries and borders underneath, and the zoom pill
 * in the corner. Each app adds its own layers as children and passes any
 * other MapLibre setting straight through.
 * @component
 * @param {BaseMapProps} props - The map props
 * @param {MapTheme} props.theme - The active map theme
 * @param {RefObject<MapRef | null>} props.mapRef - The map, for the owner's camera moves
 * @param {ReactNode} props.children - The owner's layers, markers and popups
 * @param {unknown} [props.countryFill] - A colour expression for the countries
 * @param {boolean} [props.hasZoomControls=true] - Whether the plus and minus pill shows
 * @param {() => void} [props.onZoomOut] - Replaces the plain zoom-out step
 * @returns {ReactNode} The map
 */
export function BaseMap({
  theme,
  mapRef,
  children,
  countryFill,
  hasZoomControls = true,
  onZoomOut,
  ...mapProps
}: BaseMapProps): ReactNode {
  /* Rebuilding the style object makes MapLibre diff and reload every layer. */
  const mapStyle = useMemo(() => createMapStyle(theme), [theme]);

  return (
    <>
      <MapGL
        attributionControl={false}
        dragRotate={false}
        maxPitch={0}
        minPitch={0}
        touchPitch={false}
        {...mapProps}
        mapStyle={mapStyle}
        ref={mapRef}
      >
        <WorldLayers countryFill={countryFill} theme={theme} />
        {children}
      </MapGL>
      {hasZoomControls ? (
        <ZoomControls
          onZoomIn={() =>
            mapRef.current?.zoomIn({ duration: ZOOM_DURATION_MS })
          }
          onZoomOut={
            onZoomOut ??
            (() => mapRef.current?.zoomOut({ duration: ZOOM_DURATION_MS }))
          }
        />
      ) : null}
    </>
  );
}
