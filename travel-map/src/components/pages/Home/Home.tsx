import "./Home.scss";

import { isMobile, isTablet } from "mobile-device-detect";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import {
  Outlet,
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router-dom";

import { City, Trip } from "@/core";
import { useResponsive } from "@/hooks/style/responsive";
import { useThemeDetector } from "@/hooks/style/theme";
import { parameters } from "@/utils/parameters";

import { HomeTemplate } from "../../templates";
import { ActiveView, HomeContext } from "./HomeContext";

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
 * @returns {JSX.Element} The home page with context and layout template
 */
export function Home(): JSX.Element {
  const responsive = useResponsive();
  const navigate = useNavigate();
  const location = useRouterLocation();
  const isInitialRouteRef = useRef(true);

  const [mapPosition, setMapPosition] = useState({
    center: parameters.map.defaultCenter,
    zoom: parameters.map.defaultZoom,
  });

  const [hoveredCity, setHoveredCity] = useState<City | null>(null);

  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("trips");
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

  useEffect(() => {
    const isInitialRoute = isInitialRouteRef.current;
    isInitialRouteRef.current = false;

    if (location.pathname !== "/") return;

    const state = location.state as { mapOnly?: boolean } | null;
    const navigation = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isRefresh = navigation?.type === "reload";

    if (isInitialRoute && (isRefresh || state?.mapOnly !== true)) {
      navigate("/trips", { replace: true });
      return;
    }
  }, [location, navigate]);

  const context = useMemo(
    () => ({
      isDarkTheme,
      handleDarkModeSwitch,
      hoveredCity,
      setHoveredCity,
      mapPosition,
      setMapPosition,
      responsive,
      selectedTrip,
      setSelectedTrip,
      activeView,
      setActiveView,
      isPanelOpen,
      setIsPanelOpen,
    }),
    [
      handleDarkModeSwitch,
      hoveredCity,
      isDarkTheme,
      mapPosition,
      responsive,
      selectedTrip,
      activeView,
      isPanelOpen,
    ],
  );

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
