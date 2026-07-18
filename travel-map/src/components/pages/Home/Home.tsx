import "./Home.scss";

import { isMobile, isTablet } from "mobile-device-detect";
import { ReactNode, useEffect, useReducer, useRef } from "react";
import {
  Outlet,
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router-dom";

import { City, Trip } from "@/core";
import { useResponsive } from "@/hooks/style/responsive";
import { useThemeDetector } from "@/hooks/style/theme";
import { parameters } from "@/utils/parameters";

import { HomeTemplate } from "../../templates/Home/Home";
import { ActiveView, HomeContext } from "./HomeContext";

type MapPosition = { center: [number, number]; zoom: number };

type HomeState = {
  hoveredCity: City | null;
  mapPosition: MapPosition;
  selectedTrip: Trip | null;
  activeView: ActiveView;
  isPanelOpen: boolean;
};

type HomeAction =
  | { type: "hoveredCity"; value: City | null }
  | { type: "mapPosition"; value: MapPosition }
  | { type: "selectedTrip"; value: Trip | null }
  | { type: "activeView"; value: ActiveView }
  | { type: "isPanelOpen"; value: boolean };

const initialHomeState: HomeState = {
  hoveredCity: null,
  mapPosition: {
    center: parameters.map.defaultCenter,
    zoom: parameters.map.defaultZoom,
  },
  selectedTrip: null,
  activeView: "trips",
  isPanelOpen: true,
};

function homeReducer(state: HomeState, action: HomeAction): HomeState {
  switch (action.type) {
    case "hoveredCity":
      return { ...state, hoveredCity: action.value };
    case "mapPosition":
      return { ...state, mapPosition: action.value };
    case "selectedTrip":
      return { ...state, selectedTrip: action.value };
    case "activeView":
      return { ...state, activeView: action.value };
    case "isPanelOpen":
      return { ...state, isPanelOpen: action.value };
  }
}

/**
 * Home component
 *
 * Root page component. Owns all shared state (theme, map position, hovered
 * city, selected trip, active view, panel open/close) and exposes it via
 * `HomeContext`. Redirects to `/trips` on first load unless the user navigated
 * to the map-only view explicitly.
 *
 * @component
 *
 * @returns {ReactNode} The home page with context and layout template
 */
export function Home(): ReactNode {
  const responsive = useResponsive();
  const navigate = useNavigate();
  const location = useRouterLocation();
  const isInitialRouteRef = useRef(true);
  const [state, dispatch] = useReducer(homeReducer, initialHomeState);
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();
  useEffect(() => {
    const isInitialRoute = isInitialRouteRef.current;
    isInitialRouteRef.current = false;
    if (location.pathname !== "/") return;
    const state = location.state as {
      mapOnly?: boolean;
    } | null;
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    const isRefresh = navigation?.type === "reload";
    if (isInitialRoute && (isRefresh || state?.mapOnly !== true)) {
      navigate("/trips", { replace: true });
      return;
    }
  }, [location, navigate]);
  const context = {
    isDarkTheme,
    handleDarkModeSwitch,
    hoveredCity: state.hoveredCity,
    setHoveredCity: (value: City | null) =>
      dispatch({ type: "hoveredCity", value }),
    mapPosition: state.mapPosition,
    setMapPosition: (value: MapPosition) =>
      dispatch({ type: "mapPosition", value }),
    responsive,
    selectedTrip: state.selectedTrip,
    setSelectedTrip: (value: Trip | null) =>
      dispatch({ type: "selectedTrip", value }),
    activeView: state.activeView,
    setActiveView: (value: ActiveView) =>
      dispatch({ type: "activeView", value }),
    isPanelOpen: state.isPanelOpen,
    setIsPanelOpen: (value: boolean) =>
      dispatch({ type: "isPanelOpen", value }),
  };
  return (
    <div
      className={`home ${isDarkTheme ? "home--dark" : "home--light"} ${isMobile ? "home--mobile" : isTablet ? "home--tablet" : "home--desktop"}`}
    >
      <HomeContext.Provider value={context}>
        <HomeTemplate>
          <Outlet />
        </HomeTemplate>
      </HomeContext.Provider>
    </div>
  );
}
