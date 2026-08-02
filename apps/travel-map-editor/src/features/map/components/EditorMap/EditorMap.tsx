import "./EditorMap.scss";

import countriesTopologyJson from "@app/assets/json/countries-50m.json";
import { createMapStyle, MAP_THEMES } from "@app/features/map/lib/mapTheme";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import {
  CityJson,
  fitViewport,
  MapFocus,
  toAuthoredZoom,
  toMapLibreZoom,
  TripJson,
} from "@travelmap/core";
import type { FeatureCollection, Geometry } from "geojson";
import { LngLatBounds } from "maplibre-gl";
import { ReactNode, useMemo, useRef } from "react";
import Map, {
  Layer,
  MapLayerMouseEvent,
  type MapRef,
  Marker,
  NavigationControl,
  Source,
} from "react-map-gl/maplibre";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

import { Selection } from "../../../workspace/Workspace.state";

/*
 * The public app's world polygons, so the editor reads as the same map instead
 * of a third-party tile style. Only fills and borders are drawn: labels would
 * need the app's SDF glyphs, which the editor does not serve.
 */
const topology = countriesTopologyJson as unknown as Topology<{
  countries: GeometryCollection;
}>;
const countriesGeoJson = feature(
  topology,
  topology.objects.countries,
) as FeatureCollection<Geometry>;

const FIT_PADDING_PX = 64;

/**
 * EditorMap component
 * The geography half of the workspace. Stops are numbered markers and legs are
 * lines between them, so an itinerary that doubles back or leaves a gap is
 * visible here even when the rail reads plausibly. Selecting anything selects
 * it in every other pane too.
 * @component
 * @param {EditorMapProps} props
 * @param {Map<string, CityJson>} props.cityById - Cities the trip can reference
 * @param {boolean} props.isDarkTheme - Whether the dark map theme is active
 * @param {(coordinates: [number, number]) => void} [props.onAddHere] - Called when the author clicks empty map
 * @param {(focus: MapFocus) => void} props.onCaptureView - Stores the current camera as the trip's map focus
 * @param {(selection: Selection) => void} props.onSelect - Selection callback
 * @param {Selection} props.selection - What every pane is pointed at
 * @param {TripJson} props.trip - The trip being edited
 * @returns {ReactNode} The map pane
 */
export function EditorMap({
  cityById,
  isDarkTheme,
  onAddHere,
  onCaptureView,
  onSelect,
  selection,
  trip,
}: EditorMapProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const mapRef = useRef<MapRef>(null);
  const theme = MAP_THEMES[isDarkTheme ? "dark" : "light"];
  const mapStyle = useMemo(() => createMapStyle(theme), [theme]);

  const stops = trip.steps.flatMap((step, index) => {
    if (step.type !== "stop") return [];
    const city = cityById.get(step.cityId);
    return city ? [{ city, index }] : [];
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
          properties: { index, mode: step.mode },
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

  /**
   * Frames every stop in the trip, which is the answer to "where did I go"
   * far more often than any stored camera is.
   * @returns {void}
   */
  function handleFit(): void {
    const first = stops[0];
    if (!first || !mapRef.current) return;
    const bounds = stops.reduce(
      (extent, { city }) => extent.extend(city.coordinates),
      new LngLatBounds(first.city.coordinates, first.city.coordinates),
    );
    mapRef.current.fitBounds(bounds, { padding: FIT_PADDING_PX });
  }

  /**
   * Stores the camera the author framed by hand as the trip's map focus. This
   * is the only humane way to author a centre and zoom pair, and it is the
   * only way to reach `mapFocus` at all: the previous editor never exposed it.
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
   * Offers to add a stop where the author clicked bare map.
   * @param {MapLayerMouseEvent} event - The map click
   * @returns {void}
   */
  function handleClick(event: MapLayerMouseEvent): void {
    onAddHere?.([event.lngLat.lng, event.lngLat.lat]);
  }
  return (
    <div className="editor-map">
      <Map
        attributionControl={false}
        initialViewState={initial}
        mapStyle={mapStyle}
        onClick={handleClick}
        ref={mapRef}
      >
        <Source data={countriesGeoJson} id="countries" type="geojson">
          <Layer
            id="country-fill"
            paint={{ "fill-color": theme.land }}
            type="fill"
          />
          <Layer
            id="country-border"
            paint={{ "line-color": theme.border, "line-width": 0.5 }}
            type="line"
          />
        </Source>
        <Source data={routes} id="routes" type="geojson">
          <Layer
            id="route-line"
            paint={{
              "line-color": theme.border,
              "line-dasharray": [2, 1.5],
              "line-width": 2,
            }}
            type="line"
          />
        </Source>
        <NavigationControl position="top-right" showCompass={false} />
        {stops.map(({ city, index }) => (
          <Marker
            anchor="bottom"
            key={`${city.id}-${index}`}
            latitude={city.coordinates[1]}
            longitude={city.coordinates[0]}
          >
            <button
              aria-label={t("map.selectStop", {
                city: city.name,
                position: index + 1,
              })}
              className={classNames(
                "editor-map__marker",
                selection.kind === "step" &&
                  selection.index === index &&
                  "editor-map__marker--selected",
              )}
              onClick={(event) => {
                event.stopPropagation();
                onSelect({ index, kind: "step" });
              }}
              type="button"
            >
              {stops.findIndex((entry) => entry.index === index) + 1}
            </button>
          </Marker>
        ))}
      </Map>
      <div className="editor-map__actions">
        <button
          className="editor-button"
          disabled={stops.length === 0}
          onClick={handleFit}
          type="button"
        >
          {t("map.fitToTrip")}
        </button>
        <button
          className="editor-button"
          onClick={handleCaptureView}
          type="button"
        >
          {t("map.useThisView")}
        </button>
      </div>
    </div>
  );
}

/**
 * Props for EditorMap.
 * @property {Map<string, CityJson>} cityById - Cities the trip can reference
 * @property {boolean} isDarkTheme - Whether the dark map theme is active
 * @property {(coordinates: [number, number]) => void} [onAddHere] - Called when the author clicks empty map
 * @property {(focus: MapFocus) => void} onCaptureView - Stores the current camera as the trip's map focus
 * @property {(selection: Selection) => void} onSelect - Selection callback
 * @property {Selection} selection - What every pane is pointed at
 * @property {TripJson} trip - The trip being edited
 */
interface EditorMapProps {
  cityById: Map<string, CityJson>;
  isDarkTheme: boolean;
  onAddHere?: (coordinates: [number, number]) => void;
  onCaptureView: (focus: MapFocus) => void;
  onSelect: (selection: Selection) => void;
  selection: Selection;
  trip: TripJson;
}
