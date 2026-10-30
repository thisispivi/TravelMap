import { MODE_COLORS } from "@travelmap/ui/lib/modeColors";
import { MapTheme } from "@travelmap/ui/map/lib/mapTheme";
import {
  buildRouteLayers,
  RouteStroke,
} from "@travelmap/ui/map/lib/routeLines";
import { ReactNode } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";

/*
 * Widths in pixels and dashes in multiples of the width. A cased route stays
 * readable over filled countries, borders, and labels, as road maps do.
 */
const STROKES: Record<
  RouteStroke,
  { width: number; casing: number; dash?: [number, number] }
> = {
  flight: { casing: 2.5, dash: [2.2, 1.6], width: 2.5 },
  ground: { casing: 3, width: 3.5 },
  outing: { casing: 2, dash: [0.1, 1.8], width: 2.5 },
};

/**
 * Properties accepted by the selected-trip route overlay.
 * @property {MapTheme} theme - The active map theme
 */
interface RouteOverlayProps {
  theme: MapTheme;
}

/**
 * RouteOverlay component
 * Draws the open trip's route: flights as dashed arcs, rides on the ground
 * and sea as solid lines, day trips dotted, each in its mode's colour and
 * cased in the map's halo tone.
 * @component
 * @param {RouteOverlayProps} props - The route overlay props
 * @param {MapTheme} props.theme - The active map theme
 * @returns {ReactNode} The selected trip route overlay
 */
export function RouteOverlay({ theme }: RouteOverlayProps): ReactNode {
  const { selectedTrip } = useMapInteraction();
  const { isTripDetail } = useAppRoute();
  if (!selectedTrip || !isTripDetail) return null;

  return buildRouteLayers(selectedTrip).map(({ key, stroke, mode, data }) => {
    const { width, casing, dash } = STROKES[stroke];
    return (
      <Source data={data} id={`route-${key}`} key={key} type="geojson">
        <Layer
          id={`route-casing-${key}`}
          layout={{ "line-cap": "round", "line-join": "round" }}
          paint={{
            "line-color": theme.cityLabelHalo,
            "line-opacity": stroke === "ground" ? 1 : 0.7,
            "line-width": width + casing,
          }}
          type="line"
        />
        <Layer
          id={`route-line-${key}`}
          layout={{ "line-cap": "round", "line-join": "round" }}
          paint={{
            "line-color": MODE_COLORS[mode],
            ...(dash ? { "line-dasharray": dash } : {}),
            "line-width": width,
          }}
          type="line"
        />
      </Source>
    );
  });
}
