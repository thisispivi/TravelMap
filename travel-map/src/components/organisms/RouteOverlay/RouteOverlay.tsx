import type { FeatureCollection, LineString } from "geojson";
import { ReactNode, use } from "react";
import { Layer, Source } from "react-map-gl/maplibre";

import { HomeContext } from "@/components/pages/Home/HomeContext";
import { TransportMode } from "@/core";
import { useLocation } from "@/hooks/location/location";
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

const DASHES: Partial<Record<TransportMode, [number, number]>> = {
  plane: [2, 2.5],
  ferry: [1.5, 2],
};

export function RouteOverlay(): ReactNode {
  const { selectedTrip, isDarkTheme } = use(HomeContext)!;
  const { isTripDetail } = useLocation();
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
          <Layer
            id={`route-layer-${mode}`}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-color":
                TRANSPORT_COLORS[mode] ??
                (isDarkTheme ? "rgba(255,255,255,0.7)" : "#1a73e8"),
              "line-dasharray": DASHES[mode] ?? [2, 1.5],
              "line-opacity": 0.88,
              "line-width": 2.25,
            }}
            type="line"
          />
        </Source>
      ))}
    </>
  );
}
