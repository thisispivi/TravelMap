import "./EditorMap.scss";

import { createMapStyle, MAP_THEMES } from "@app/features/map/lib/mapTheme";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import variables from "@app/styles/_variables.module.scss";
import {
  CityJson,
  fitViewport,
  MapFocus,
  toAuthoredZoom,
  toMapLibreZoom,
  TripJson,
} from "@travelmap/core";
import type { FeatureCollection, Geometry } from "geojson";
import { Focus, MapPinPlus, ScanLine, X } from "lucide-react";
import { LngLatBounds } from "maplibre-gl";
import { ReactNode, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  MapLayerMouseEvent,
  type MapRef,
  Marker,
  NavigationControl,
  Source,
} from "react-map-gl/maplibre";

import { Selection } from "../../../workspace/Workspace.state";
import { WorldLayers } from "../WorldLayers/WorldLayers";

const FIT_PADDING_PX = 64;

/*
 * The same mode palette the public map paints a published trip with, so a
 * route that is being authored and the same route once shipped read alike.
 */
const MODE_COLORS = [
  "plane",
  variables.transportPlane,
  "ferry",
  variables.transportFerry,
  "train",
  variables.transportTrain,
  "bus",
  variables.transportBus,
  "car",
  variables.transportCar,
  "taxi",
  variables.transportTaxi,
  "walk",
  variables.transportWalk,
] as const;

/**
 * EditorMap component
 * The geography half of the workspace. Stays are numbered markers, layovers are
 * smaller and quieter than the destinations they connect, and legs are drawn in
 * their own transport mode's colour, so an itinerary that doubles back, leaves
 * a gap, or flies a leg that should have been a train is visible here even when
 * the rail reads plausibly. Hovering or selecting anything points every other
 * pane at it too.
 * @component
 * @param {EditorMapProps} props
 * @param {number[]} props.activeIndexes - Steps the current selection covers
 * @param {Map<string, CityJson>} props.cityById - Cities the trip can reference
 * @param {number | null} props.hovered - The step another pane is pointing at
 * @param {boolean} props.isDarkTheme - Whether the dark map theme is active
 * @param {(coordinates: [number, number]) => void} props.onAddHere - Adds a place at a clicked point
 * @param {() => void} props.onClearSelection - Called when bare map is clicked
 * @param {(focus: MapFocus) => void} props.onCaptureView - Stores the current camera as the trip's map focus
 * @param {(index: number | null) => void} props.onHover - Hover callback
 * @param {(selection: Selection) => void} props.onSelect - Selection callback
 * @param {Selection} props.selection - What every pane is pointed at
 * @param {TripJson} props.trip - The trip being edited
 * @returns {ReactNode} The map pane
 */
export function EditorMap({
  activeIndexes,
  cityById,
  hovered,
  isDarkTheme,
  onAddHere,
  onCaptureView,
  onClearSelection,
  onHover,
  onSelect,
  selection,
  trip,
}: EditorMapProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const mapRef = useRef<MapRef>(null);
  const [isPinning, setIsPinning] = useState(false);
  const theme = MAP_THEMES[isDarkTheme ? "dark" : "light"];
  const mapStyle = useMemo(() => createMapStyle(theme), [theme]);

  const stops = trip.steps.flatMap((step, index) => {
    if (step.type !== "stop") return [];
    const city = cityById.get(step.cityId);
    return city ? [{ city, index, isLayover: step.isLayover === true }] : [];
  });
  const routes: FeatureCollection<Geometry> = {
    features: trip.steps.flatMap((step, index) => {
      if (step.type !== "transport") return [];
      const from = cityById.get(step.fromId);
      const to = cityById.get(step.toId);
      if (!from || !to || step.fromId === step.toId) return [];
      return [
        {
          geometry: {
            coordinates: [from.coordinates, to.coordinates],
            type: "LineString" as const,
          },
          properties: {
            index,
            isActive: activeIndexes.includes(index) || hovered === index,
            mode: step.mode,
          },
          type: "Feature" as const,
        },
      ];
    }),
    type: "FeatureCollection",
  };
  const initial = trip.mapFocus
    ? {
        latitude: trip.mapFocus.center[1],
        longitude: trip.mapFocus.center[0],
        zoom: toMapLibreZoom(trip.mapFocus.zoom),
      }
    : (() => {
        const suggested = fitViewport(
          stops.map(({ city }) => city.coordinates),
        );
        return {
          latitude: suggested?.center[1] ?? 20,
          longitude: suggested?.center[0] ?? 0,
          zoom: suggested ? toMapLibreZoom(suggested.zoom) : 1.5,
        };
      })();
  const isDaySelected = selection.kind === "day";
  const framed = isDaySelected
    ? stops.filter(({ index }) => activeIndexes.includes(index))
    : stops;

  /**
   * Frames the selected day when there is one and the whole trip otherwise,
   * which is the answer to "where did I go" far more often than any stored
   * camera is.
   * @returns {void}
   */
  function handleFit(): void {
    const first = framed[0];
    if (!first || !mapRef.current) return;
    const bounds = framed.reduce(
      (extent, { city }) => extent.extend(city.coordinates),
      new LngLatBounds(first.city.coordinates, first.city.coordinates),
    );
    mapRef.current.fitBounds(bounds, { padding: FIT_PADDING_PX });
  }

  /**
   * Stores the current camera centre and zoom as the trip's authored map focus.
   * @returns {void}
   */
  function handleCaptureView(): void {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    onCaptureView({
      center: [Number(center.lng.toFixed(4)), Number(center.lat.toFixed(4))],
      zoom: toAuthoredZoom(map.getZoom()),
    });
  }

  /**
   * Adds a place where the author clicked while pinning, and otherwise clears
   * the selection. A bare click used to open the place dialog, which turned
   * every misjudged pan into a modal, so adding a place is now something the
   * author arms first.
   * @param {MapLayerMouseEvent} event - The map click
   * @returns {void}
   */
  function handleClick(event: MapLayerMouseEvent): void {
    if (!isPinning) {
      onClearSelection();
      return;
    }
    setIsPinning(false);
    onAddHere([event.lngLat.lng, event.lngLat.lat]);
  }

  /**
   * Lifts the marker another pane is pointing at above the ones stacked on the
   * same city, which is the only way a repeated destination stays reachable.
   * @param {number} index - Position of the step
   * @returns {number} The stacking order for that marker
   */
  function markerDepth(index: number): number {
    if (hovered === index) return 3;
    if (selection.kind === "step" && selection.index === index) return 2;
    return activeIndexes.includes(index) ? 1 : 0;
  }
  return (
    <div
      className={classNames(
        "editor-map",
        isPinning && "editor-map--pinning",
        isDaySelected && "editor-map--day-focus",
      )}
    >
      <Map
        attributionControl={false}
        dragRotate={false}
        initialViewState={initial}
        mapStyle={mapStyle}
        maxPitch={0}
        onClick={handleClick}
        ref={mapRef}
        renderWorldCopies={false}
      >
        <WorldLayers theme={theme} />
        <Source data={routes} id="routes" type="geojson">
          <Layer
            id="route-line"
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-color": [
                "match",
                ["get", "mode"],
                ...MODE_COLORS,
                theme.border,
              ],
              "line-opacity": ["case", ["get", "isActive"], 1, 0.75],
              "line-width": ["case", ["get", "isActive"], 3.5, 2],
            }}
            type="line"
          />
        </Source>
        <NavigationControl position="top-right" showCompass={false} />
        {stops.map(({ city, index, isLayover }) => (
          <Marker
            anchor="bottom"
            key={`${city.id}-${index}`}
            latitude={city.coordinates[1]}
            longitude={city.coordinates[0]}
            style={{ zIndex: markerDepth(index) }}
          >
            <button
              aria-label={t("map.selectStop", {
                city: city.name,
                position: index + 1,
              })}
              className={classNames(
                "editor-map__marker",
                isLayover && "editor-map__marker--layover",
                activeIndexes.includes(index) && "editor-map__marker--active",
                hovered === index && "editor-map__marker--hovered",
                selection.kind === "step" &&
                  selection.index === index &&
                  "editor-map__marker--selected",
              )}
              onBlur={() => onHover(null)}
              onClick={(event) => {
                event.stopPropagation();
                onSelect({ index, kind: "step" });
              }}
              onFocus={() => onHover(index)}
              onMouseEnter={() => onHover(index)}
              onMouseLeave={() => onHover(null)}
              title={city.name}
              type="button"
            >
              {stops.findIndex((entry) => entry.index === index) + 1}
            </button>
          </Marker>
        ))}
      </Map>
      {isPinning ? (
        <p className="editor-map__hint" role="status">
          {t("map.pinPlaceHint")}
        </p>
      ) : null}
      <div className="editor-map__actions">
        <button
          aria-pressed={isPinning}
          className={classNames(
            "editor-button",
            isPinning ? "editor-button--danger" : "editor-button--primary",
          )}
          onClick={() => setIsPinning(!isPinning)}
          type="button"
        >
          {isPinning ? (
            <X aria-hidden="true" />
          ) : (
            <MapPinPlus aria-hidden="true" />
          )}
          {isPinning ? t("editorForm.cancel") : t("map.pinPlace")}
        </button>
        <button
          className="editor-button"
          disabled={framed.length === 0}
          onClick={handleFit}
          type="button"
        >
          <ScanLine aria-hidden="true" />
          {isDaySelected ? t("map.fitToDay") : t("map.fitToTrip")}
        </button>
        <button
          className="editor-button"
          onClick={handleCaptureView}
          type="button"
        >
          <Focus aria-hidden="true" />
          {t("map.useThisView")}
        </button>
      </div>
    </div>
  );
}

/**
 * Props for EditorMap.
 * @property {number[]} activeIndexes - Steps the current selection covers
 * @property {Map<string, CityJson>} cityById - Cities the trip can reference
 * @property {number | null} hovered - The step another pane is pointing at
 * @property {boolean} isDarkTheme - Whether the dark map theme is active
 * @property {(coordinates: [number, number]) => void} onAddHere - Adds a place at a clicked point
 * @property {(focus: MapFocus) => void} onCaptureView - Stores the current camera as the trip's map focus
 * @property {() => void} onClearSelection - Called when bare map is clicked
 * @property {(index: number | null) => void} onHover - Hover callback
 * @property {(selection: Selection) => void} onSelect - Selection callback
 * @property {Selection} selection - What every pane is pointed at
 * @property {TripJson} trip - The trip being edited
 */
interface EditorMapProps {
  activeIndexes: number[];
  cityById: Map<string, CityJson>;
  hovered: number | null;
  isDarkTheme: boolean;
  onAddHere: (coordinates: [number, number]) => void;
  onCaptureView: (focus: MapFocus) => void;
  onClearSelection: () => void;
  onHover: (index: number | null) => void;
  onSelect: (selection: Selection) => void;
  selection: Selection;
  trip: TripJson;
}
