import type { Feature, FeatureCollection, LineString } from "geojson";
import { ReactNode } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

import { futureTrips, visitedTrips } from "@/data/world";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { reckonAll, resolveOrigin } from "@/shared/lib/bearings";
import variables from "@/styles/_variables.module.scss";

import { greatCircle } from "../../lib/geo";

/**
 * Wraps a sampled arc as a GeoJSON feature.
 * @param {[number, number][]} coordinates - The sampled arc
 * @returns {Feature<LineString>} The arc as a line feature
 */
function toFeature(coordinates: [number, number][]): Feature<LineString> {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates },
  };
}

/**
 * Properties accepted by the thread overlay.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 */
interface ThreadOverlayProps {
  isDarkTheme: boolean;
}

/**
 * ThreadOverlay component
 * Draws the whole record on the plate at once: one great-circle thread from the
 * origin out to the furthest point of every journey. Without it the map is a
 * field of unconnected pins that says nothing until a journey is opened; with
 * it the plate carries the same picture as the rose, in its own projection.
 * @component
 * @param {ThreadOverlayProps} props - The thread overlay props
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @returns {ReactNode} The record's threads, or null when a single journey is open
 */
export function ThreadOverlay({ isDarkTheme }: ThreadOverlayProps): ReactNode {
  const { isTrip } = useAppRoute();
  const { focusedTrip } = useMapInteraction();
  const origin = resolveOrigin();

  if (isTrip || !origin) return null;

  const entries = reckonAll([...visitedTrips, ...futureTrips], origin);

  const quiet: FeatureCollection<LineString> = {
    type: "FeatureCollection",
    features: entries.flatMap((entry) =>
      !entry.furthest || entry.trip.id === focusedTrip?.id
        ? []
        : [
            toFeature(
              greatCircle(origin.coordinates, entry.furthest.coordinates),
            ),
          ],
    ),
  };
  const focused = entries.find((entry) => entry.trip.id === focusedTrip?.id);
  const lit: FeatureCollection<LineString> = {
    type: "FeatureCollection",
    features:
      focused && focused.furthest
        ? [
            toFeature(
              greatCircle(origin.coordinates, focused.furthest.coordinates),
            ),
          ]
        : [],
  };

  return (
    <>
      <Source data={quiet} id="record-threads" type="geojson">
        <Layer
          id="record-threads-layer"
          layout={{ "line-cap": "round" }}
          paint={{
            "line-color": isDarkTheme ? "#e9ece9" : "#16191a",
            "line-opacity": 0.22,
            "line-width": 0.75,
          }}
          type="line"
        />
      </Source>

      <Source data={lit} id="record-thread-focused" type="geojson">
        <Layer
          id="record-thread-focused-layer"
          layout={{ "line-cap": "round" }}
          paint={{
            "line-color": variables.pin,
            "line-opacity": 0.95,
            "line-width": 1.75,
          }}
          type="line"
        />
      </Source>
    </>
  );
}
