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

/*
 * A journey between two beds is the trip's spine, so it is drawn solid; a day
 * trip that comes back to the same bed is dashed, which keeps "based in Kyoto,
 * went to Osaka" readable on the map as well as in the panel.
 */
const OUTING_DASH: [number, number] = [2, 1.5];

/**
 * Properties accepted by the selected-trip route overlay.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 */
interface RouteOverlayProps {
  isDarkTheme: boolean;
}

/**
 * RouteOverlay component
 * Draws the selected trip route as map layers grouped by transport mode, with
 * journeys solid and day trips dashed.
 * @component
 * @param {RouteOverlayProps} props - The route overlay props
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @returns {ReactNode} The selected trip route overlay
 */
export function RouteOverlay({ isDarkTheme }: RouteOverlayProps): ReactNode {
  const { selectedTrip } = useMapInteraction();
  const { isTripDetail } = useAppRoute();
  if (!selectedTrip || !isTripDetail) return null;

  const byLayer = new Map<
    string,
    {
      mode: TransportMode;
      isOuting: boolean;
      data: FeatureCollection<LineString>;
    }
  >();
  for (const leg of selectedTrip.getLegs()) {
    const cities = [leg.from, ...leg.via, leg.to];
    const key = `${leg.mode}-${leg.context}`;
    const layer = byLayer.get(key) ?? {
      data: { features: [], type: "FeatureCollection" },
      isOuting: leg.context === "outing",
      mode: leg.mode,
    };
    for (const [index, city] of cities.slice(0, -1).entries()) {
      layer.data.features.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [city.coordinates, cities[index + 1].coordinates],
        },
      });
    }
    byLayer.set(key, layer);
  }

  return (
    <>
      {Array.from(byLayer, ([key, { data, isOuting, mode }]) => (
        <Source data={data} id={`route-${key}`} key={key} type="geojson">
          <Layer
            id={`route-layer-${key}`}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-color":
                TRANSPORT_COLORS[mode] ??
                (isDarkTheme ? "rgba(255,255,255,0.7)" : "#1a73e8"),
              "line-dasharray": isOuting ? OUTING_DASH : [1, 0],
              "line-opacity": 0.88,
              "line-width": isOuting ? 2 : 2.75,
            }}
            type="line"
          />
        </Source>
      ))}
    </>
  );
}
