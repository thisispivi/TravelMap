import { TransportMode } from "@travelmap/core";
import type { FeatureCollection, LineString } from "geojson";
import { ReactNode } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import variables from "@/styles/_variables.module.scss";

const TRANSPORT_COLORS: Partial<Record<TransportMode, string>> = {
  ferry: variables.transportFerry,
  plane: variables.transportPlane,
  bus: variables.transportBus,
  train: variables.transportTrain,
  car: variables.transportCar,
  taxi: variables.transportTaxi,
  walk: variables.transportWalk,
};

/* Only the modes whose drawn line is an abstraction rather than a real path are
   dashed, so a solid line can be trusted to mean "this route was travelled". */
const DASHES: Partial<Record<TransportMode, [number, number]>> = {
  plane: [2, 2.5],
  ferry: [1.5, 2],
};

const ROUTE_LINE_WIDTH = 2.5;
const ROUTE_CASING_WIDTH = 5;

/* MapLibre measures dashes in multiples of the line width, so the casing needs
   its own values to cover the same ground as the thinner line above it. */
const CASING_DASHES: Partial<Record<TransportMode, [number, number]>> =
  Object.fromEntries(
    Object.entries(DASHES).map(([mode, [dash, gap]]) => [
      mode,
      [
        (dash * ROUTE_LINE_WIDTH) / ROUTE_CASING_WIDTH,
        (gap * ROUTE_LINE_WIDTH) / ROUTE_CASING_WIDTH,
      ],
    ]),
  );

/**
 * Properties accepted by the selected-trip route overlay.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 */
interface RouteOverlayProps {
  isDarkTheme: boolean;
}

/**
 * RouteOverlay component
 * Draws the selected trip route as map layers grouped by transport mode.
 * @component
 * @param {RouteOverlayProps} props - The route overlay props
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @returns {ReactNode} The selected trip route overlay
 */
export function RouteOverlay({ isDarkTheme }: RouteOverlayProps): ReactNode {
  const { selectedTrip } = useMapInteraction();
  const { isTripDetail } = useAppRoute();
  if (!selectedTrip || !isTripDetail) return null;

  const byMode = new Map<TransportMode, FeatureCollection<LineString>>();
  for (const step of selectedTrip.getRouteSegments()) {
    const cities = [step.from, ...(step.via ?? step.ferry?.via ?? []), step.to];
    const collection = byMode.get(step.mode) ?? {
      type: "FeatureCollection",
      features: [],
    };
    for (const [index, city] of cities.slice(0, -1).entries()) {
      collection.features.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [city.coordinates, cities[index + 1].coordinates],
        },
      });
    }
    byMode.set(step.mode, collection);
  }

  return (
    <>
      {Array.from(byMode, ([mode, data]) => (
        <Source data={data} id={`route-${mode}`} key={mode} type="geojson">
          {/* A casing under the coloured line keeps every mode legible against
              both the land tone and the ocean it crosses. It repeats the dash
              pattern so a dashed mode still reads as dashed. */}
          <Layer
            id={`route-casing-${mode}`}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-blur": 0.5,
              "line-color": isDarkTheme
                ? "rgba(0, 0, 0, 0.55)"
                : "rgba(255, 255, 255, 0.75)",
              ...(DASHES[mode]
                ? { "line-dasharray": CASING_DASHES[mode] }
                : {}),
              "line-width": ROUTE_CASING_WIDTH,
            }}
            type="line"
          />
          <Layer
            id={`route-layer-${mode}`}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-color":
                TRANSPORT_COLORS[mode] ??
                (isDarkTheme ? "rgba(255,255,255,0.7)" : "#1a73e8"),
              ...(DASHES[mode] ? { "line-dasharray": DASHES[mode] } : {}),
              "line-opacity": 0.95,
              "line-width": ROUTE_LINE_WIDTH,
            }}
            type="line"
          />
        </Source>
      ))}
    </>
  );
}
