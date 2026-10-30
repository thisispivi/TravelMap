import "./EditorMap.scss";

import { createMapStyle, readMapTheme } from "@app/features/map/lib/mapTheme";
import { arcBetween, nearSide } from "@app/features/map/lib/routeLines";
import { classNames } from "@app/shared/lib/classNames";
import { MODE_COLORS } from "@app/shared/lib/modeColors";
import type { FeatureCollection, LineString } from "geojson";
import { LngLatBounds } from "maplibre-gl";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import Map, {
  Layer,
  MapLayerMouseEvent,
  type MapRef,
  Marker,
  NavigationControl,
  Source,
} from "react-map-gl/maplibre";

import {
  MapRoute,
  MapScene,
  useMapSceneContext,
} from "../../../../shared/context/MapScene.context";
import { WorldLayers } from "../WorldLayers/WorldLayers";

/* Room kept around the framed places, beyond whatever the panel covers. */
const FRAME_PADDING_PX = 56;
/* A single place is shown close enough to read its surroundings. */
const SINGLE_PLACE_ZOOM = 7;
/* Framing never zooms closer than a region, even for two nearby towns. */
const FRAME_MAX_ZOOM = 9;
const CAMERA_DURATION_MS = 900;
const ROUTE_LAYERS = [
  "editor-route-ground",
  "editor-route-flight",
  "editor-route-outing",
];

/**
 * Turns the scene's rides into one line feature each, coloured by mode.
 * Flights bow into the same arcs the site draws; ground rides take the short
 * way across the antimeridian.
 * @param {MapRoute[]} routes - The rides
 * @returns {FeatureCollection<LineString>} The lines, with id, colour and stroke
 */
function routeFeatures(routes: MapRoute[]): FeatureCollection<LineString> {
  return {
    features: routes.map(({ from, id, isOuting, mode, to }) => ({
      geometry: {
        coordinates:
          mode === "plane" ? arcBetween(from, to) : [from, nearSide(from, to)],
        type: "LineString",
      },
      properties: {
        color: MODE_COLORS[mode],
        id,
        stroke: isOuting ? "outing" : mode === "plane" ? "flight" : "ground",
      },
      type: "Feature",
    })),
    type: "FeatureCollection",
  };
}

/**
 * Properties accepted by the EditorMap component.
 * @property {boolean} isDarkTheme - Whether the dark map theme is active
 * @property {number} insetLeft - How far from the left edge the panel covers the map, in pixels
 */
interface EditorMapProps {
  isDarkTheme: boolean;
  insetLeft: number;
}

/**
 * EditorMap component
 * The one map behind every panel of the editor. It draws whatever scene the
 * panel on screen describes, styled as the site draws trips, frames the
 * scene's places in the part of the map the panel leaves visible, and hands
 * presses on pins, rides and empty ground back to that panel.
 * @component
 * @param {EditorMapProps} props - The map props
 * @param {boolean} props.isDarkTheme - Whether the dark map theme is active
 * @param {number} props.insetLeft - How far from the left the panel covers the map
 * @returns {ReactNode} The map
 */
export function EditorMap({
  isDarkTheme,
  insetLeft,
}: EditorMapProps): ReactNode {
  const { handlersRef, scene, viewReaderRef } = useMapSceneContext();
  const mapRef = useRef<MapRef>(null);
  const sceneRef = useRef<MapScene>(scene);
  const theme = useMemo(() => readMapTheme(isDarkTheme), [isDarkTheme]);
  const mapStyle = useMemo(() => createMapStyle(theme), [theme]);
  const frameKey = JSON.stringify(scene.frame);
  const selectedId = scene.selectedId ?? "";

  useEffect(() => {
    sceneRef.current = scene;
  });

  useEffect(() => {
    viewReaderRef.current = () => {
      const map = mapRef.current;
      if (!map) return undefined;
      const center = map.getCenter();
      return { center: [center.lng, center.lat], zoom: map.getZoom() };
    };
    return () => {
      viewReaderRef.current = null;
    };
  }, [viewReaderRef]);

  useEffect(() => {
    const map = mapRef.current;
    const [first, ...rest] = sceneRef.current.frame;
    if (!map || !first) return;
    const padding = {
      bottom: FRAME_PADDING_PX,
      left: insetLeft + FRAME_PADDING_PX,
      right: FRAME_PADDING_PX,
      top: FRAME_PADDING_PX,
    };
    if (rest.length === 0) {
      map.flyTo({
        center: first,
        duration: CAMERA_DURATION_MS,
        padding,
        zoom: Math.max(map.getZoom(), SINGLE_PLACE_ZOOM),
      });
      return;
    }
    const bounds = rest.reduce(
      (extent, point) => extent.extend(point),
      new LngLatBounds(first, first),
    );
    map.fitBounds(bounds, {
      duration: CAMERA_DURATION_MS,
      maxZoom: FRAME_MAX_ZOOM,
      padding,
    });
  }, [frameKey, insetLeft]);

  /**
   * Hands a press to the panel: a ride when one was hit, otherwise the spot.
   * @param {MapLayerMouseEvent} event - The press
   * @returns {void}
   */
  const handleClick = (event: MapLayerMouseEvent): void => {
    const rideId = event.features?.[0]?.properties?.id;
    if (typeof rideId === "string") {
      handlersRef.current.onSelect?.(rideId);
      return;
    }
    handlersRef.current.onPick?.([event.lngLat.lng, event.lngLat.lat]);
  };

  return (
    <div className="editor-map">
      <Map
        attributionControl={false}
        dragRotate={false}
        initialViewState={{ latitude: 30, longitude: 10, zoom: 1.6 }}
        interactiveLayerIds={ROUTE_LAYERS}
        mapStyle={mapStyle}
        maxPitch={0}
        onClick={handleClick}
        ref={mapRef}
      >
        <WorldLayers theme={theme} />
        <Source
          data={routeFeatures(scene.routes)}
          id="editor-routes"
          type="geojson"
        >
          <Layer
            filter={["==", ["get", "stroke"], "ground"]}
            id="editor-route-ground"
            layout={{ "line-cap": "round" }}
            paint={{
              "line-color": ["get", "color"],
              "line-width": ["case", ["==", ["get", "id"], selectedId], 5, 3],
            }}
            type="line"
          />
          <Layer
            filter={["==", ["get", "stroke"], "flight"]}
            id="editor-route-flight"
            paint={{
              "line-color": ["get", "color"],
              "line-dasharray": [2, 1.6],
              "line-width": ["case", ["==", ["get", "id"], selectedId], 4, 2.5],
            }}
            type="line"
          />
          <Layer
            filter={["==", ["get", "stroke"], "outing"]}
            id="editor-route-outing"
            layout={{ "line-cap": "round" }}
            paint={{
              "line-color": ["get", "color"],
              "line-dasharray": [0.1, 2],
              "line-width": ["case", ["==", ["get", "id"], selectedId], 4, 2.5],
            }}
            type="line"
          />
        </Source>
        <NavigationControl position="top-right" showCompass={false} />
        {scene.pins.map((pin) => (
          <Marker
            anchor={pin.tone === "place" ? "bottom" : "center"}
            key={pin.id}
            latitude={pin.coordinates[1]}
            longitude={pin.coordinates[0]}
          >
            <button
              aria-label={pin.label}
              className={classNames(
                "editor-map__pin",
                `editor-map__pin--${pin.tone}`,
                pin.id === selectedId && "editor-map__pin--selected",
              )}
              onClick={(event) => {
                event.stopPropagation();
                handlersRef.current.onSelect?.(pin.id);
              }}
              title={pin.label}
              type="button"
            >
              {pin.tone === "place" ? (
                <svg aria-hidden="true" viewBox="0 0 466.7 666.7">
                  <path d="M233.3,0C104.5,0,0,104.5,0,233.3c0,128.9,233.3,433.3,233.3,433.3s233.3-304.5,233.3-433.3C466.7,104.5,362.2,0,233.3,0L233.3,0z M233.3,350c-64.4,0-116.7-52.2-116.7-116.7s52.2-116.7,116.7-116.7l0,0c64.4,0,116.7,52.2,116.7,116.7S297.8,350,233.3,350z" />
                  <circle cx="233.3" cy="233.3" r="116.7" />
                </svg>
              ) : (
                pin.number
              )}
            </button>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
