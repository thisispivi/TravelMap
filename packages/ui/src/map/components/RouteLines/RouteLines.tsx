import { TransportModeSchema } from "@travelmap/core";
import { ReactNode } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

import { MODE_COLORS } from "../../../lib/modeColors";
import { MapTheme } from "../../lib/mapTheme";
import {
  ROUTE_STROKE_ORDER,
  RouteFeatures,
  routeLineLayerId,
  RouteStroke,
} from "../../lib/routeLines";

const STROKES: Record<
  RouteStroke,
  { width: number; casing: number; dash?: number[] }
> = {
  flight: { casing: 2.5, dash: [2.2, 1.6], width: 2.5 },
  ground: { casing: 3, width: 3.5 },
  outing: { casing: 2, dash: [0.1, 1.8], width: 2.5 },
};

/* A selected ride is drawn this much wider than the others. */
const SELECTED_EXTRA_WIDTH = 1.5;

const MODE_COLOR = [
  "match",
  ["get", "mode"],
  ...TransportModeSchema.options.flatMap((mode) => [mode, MODE_COLORS[mode]]),
  MODE_COLORS.plane,
];

/**
 * Properties accepted by the RouteLines component.
 * @property {string} id - The source id, unique on the map
 * @property {RouteFeatures} routes - The segments to draw
 * @property {MapTheme} theme - The active map theme
 * @property {string} [selectedId] - The ride drawn wider
 */
interface RouteLinesProps {
  id: string;
  routes: RouteFeatures;
  theme: MapTheme;
  selectedId?: string;
}

/**
 * RouteLines component
 * Every ride on a map, the same on the site and in the editor: in its mode's
 * colour over a casing of the label halo, solid on the ground, dotted for a
 * day trip, and a dashed arc for a flight.
 * @component
 * @param {RouteLinesProps} props - The layer props
 * @param {string} props.id - The source id, unique on the map
 * @param {RouteFeatures} props.routes - The segments to draw
 * @param {MapTheme} props.theme - The active map theme
 * @param {string} [props.selectedId] - The ride drawn wider
 * @returns {ReactNode} The route layers
 */
export function RouteLines({
  id,
  routes,
  theme,
  selectedId = "",
}: RouteLinesProps): ReactNode {
  return (
    <Source data={routes} id={id} type="geojson">
      {ROUTE_STROKE_ORDER.flatMap((stroke) => {
        const { width, casing, dash } = STROKES[stroke];
        const filter = ["==", ["get", "stroke"], stroke];
        const lineWidth = [
          "case",
          ["==", ["get", "id"], selectedId],
          width + SELECTED_EXTRA_WIDTH,
          width,
        ];
        return [
          <Layer
            /* MapLibre's expression types are not exported in a usable form. */
            filter={filter as never}
            id={`${id}-casing-${stroke}`}
            key={`casing-${stroke}`}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-color": theme.cityLabelHalo,
              "line-opacity": stroke === "ground" ? 1 : 0.7,
              "line-width": ["+", lineWidth, casing] as never,
            }}
            type="line"
          />,
          <Layer
            filter={filter as never}
            id={routeLineLayerId(id, stroke)}
            key={`line-${stroke}`}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-color": MODE_COLOR as never,
              ...(dash ? { "line-dasharray": dash } : {}),
              "line-width": lineWidth as never,
            }}
            type="line"
          />,
        ];
      })}
    </Source>
  );
}
