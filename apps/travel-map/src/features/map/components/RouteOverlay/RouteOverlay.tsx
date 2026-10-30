import { RouteLines } from "@travelmap/ui/map/components/RouteLines/RouteLines";
import { tripRouteFeatures } from "@travelmap/ui/map/lib/routeLines";
import { ReactNode } from "react";

import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";

/**
 * RouteOverlay component
 * The open trip's rides, drawn on the map only while the trip's page is
 * showing, so the world map stays clean everywhere else.
 * @component
 * @returns {ReactNode} The trip's route layers, or nothing
 */
export function RouteOverlay(): ReactNode {
  const { selectedTrip } = useMapInteraction();
  const { isTripDetail } = useAppRoute();
  if (!selectedTrip || !isTripDetail) return null;

  return (
    <RouteLines id="trip-routes" routes={tripRouteFeatures(selectedTrip)} />
  );
}
