import "./MapShell.scss";

import { City, Trip } from "@travelmap/core";
import { isMobile, isTablet } from "mobile-device-detect";
import { ReactNode, useEffect, useReducer, useRef } from "react";
import {
  Outlet,
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router";

import { AppRouteContext } from "@/shared/context/AppRoute.context";
import {
  MapInteractionContext,
  MapInteractionContextValue,
} from "@/shared/context/MapInteraction.context";
import {
  PanelContext,
  PanelContextValue,
} from "@/shared/context/Panel.context";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { useThemeDetector } from "@/shared/hooks/useThemeDetector";

import { useAppLocation } from "../routing/useAppLocation";
import { MapShellLayout } from "./MapShell.layout";
import {
  initialMapShellState,
  mapShellReducer,
  MapShellState,
} from "./MapShell.state";

/**
 * MapShell component
 * Owns state shared by the persistent map and its route-driven panels. It
 * redirects the initial root route to `/trips` unless navigation explicitly
 * requested the map-only view.
 * @component
 * @returns {ReactNode} The map shell with its context and active route outlet
 */
export function MapShell(): ReactNode {
  const responsive = useResponsive();
  const appRoute = useAppLocation();
  const navigate = useNavigate();
  const location = useRouterLocation();
  const isInitialRouteRef = useRef(true);
  const [mapShellState, dispatchMapShellAction] = useReducer(
    mapShellReducer,
    initialMapShellState,
  );
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();

  useEffect(() => {
    const isInitialRoute = isInitialRouteRef.current;
    isInitialRouteRef.current = false;
    if (location.pathname !== "/") return;

    const navigationState = location.state as {
      mapOnly?: boolean;
    } | null;
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    const isRefresh = navigation?.type === "reload";
    if (isInitialRoute && (isRefresh || navigationState?.mapOnly !== true)) {
      navigate("/trips", { replace: true });
      return;
    }
  }, [location, navigate]);

  const mapInteractionContextValue: MapInteractionContextValue = {
    hoveredCity: mapShellState.hoveredCity,
    mapPosition: mapShellState.mapPosition,
    selectedTrip: mapShellState.selectedTrip,
    setHoveredCity: (value: City | null) =>
      dispatchMapShellAction({ type: "hoveredCity", value }),
    setMapPosition: (value: MapShellState["mapPosition"]) =>
      dispatchMapShellAction({ type: "mapPosition", value }),
    setSelectedTrip: (value: Trip | null) =>
      dispatchMapShellAction({ type: "selectedTrip", value }),
  };
  const panelContextValue: PanelContextValue = {
    isPanelOpen: mapShellState.isPanelOpen,
    setIsPanelOpen: (value: boolean) =>
      dispatchMapShellAction({ type: "isPanelOpen", value }),
  };

  return (
    <div
      className={`map-shell ${isDarkTheme ? "map-shell--dark" : "map-shell--light"} ${isMobile ? "map-shell--mobile" : isTablet ? "map-shell--tablet" : "map-shell--desktop"}`}
    >
      <AppRouteContext.Provider value={appRoute}>
        <MapInteractionContext.Provider value={mapInteractionContextValue}>
          <PanelContext.Provider value={panelContextValue}>
            <MapShellLayout
              handleDarkModeSwitch={handleDarkModeSwitch}
              isDarkTheme={isDarkTheme}
              responsive={responsive}
            >
              <Outlet />
            </MapShellLayout>
          </PanelContext.Provider>
        </MapInteractionContext.Provider>
      </AppRouteContext.Provider>
    </div>
  );
}
