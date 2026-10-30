import { RouteLines } from "@travelmap/ui/map/components/RouteLines/RouteLines";
import { MapTheme } from "@travelmap/ui/map/lib/mapTheme";
import { tripRouteFeatures } from "@travelmap/ui/map/lib/routeLines";
import { ReactNode } from "react";

import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";

/**
 * Properties accepted by the RouteOverlay component.
 * @property {MapTheme} theme - The active map theme
 */
interface RouteOverlayProps {
  theme: MapTheme;
}

/**
 * RouteOverlay component
 * The open trip's rides, drawn on the map only while the trip's page is
 * showing, so the world map stays clean everywhere else.
 * @component
 * @param {RouteOverlayProps} props - The overlay props
 * @param {MapTheme} props.theme - The active map theme
 * @returns {ReactNode} The trip's route layers, or nothing
 */
export function RouteOverlay({ theme }: RouteOverlayProps): ReactNode {
  const { selectedTrip } = useMapInteraction();
  const { isTripDetail } = useAppRoute();
  if (!selectedTrip || !isTripDetail) return null;

  return (
    <RouteLines
      id="trip-routes"
      routes={tripRouteFeatures(selectedTrip)}
      theme={theme}
    />
  );
}
