import "./Home.scss";

import { isMobile, isTablet } from "mobile-device-detect";
import { JSX, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import { City } from "@/core";
import { useResponsive } from "@/hooks/style/responsive";
import { useThemeDetector } from "@/hooks/style/theme";
import { parameters } from "@/utils/parameters";

import { HomeTemplate } from "../../templates";
import { HomeContext } from "./HomeContext";

/**
 * Home component
 *
 * The home component is the main component of the application. It is used to display the map and the left bar.
 *
 * @component
 *
 * @returns {JSX.Element} - The home
 */
export function Home(): JSX.Element {
  const responsive = useResponsive();

  const [isAutoPosition, setIsAutoPosition] = useState<boolean>(false);

  const [mapPosition, setMapPosition] = useState({
    center: parameters.map.defaultCenter,
    zoom: parameters.map.defaultZoom,
  });

  const [hoveredCity, setHoveredCity] = useState<City | null>(null);

  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();

  const context = useMemo(
    () => ({
      isDarkTheme,
      handleDarkModeSwitch,
      hoveredCity,
      setHoveredCity,
      mapPosition,
      setMapPosition,
      isAutoPosition,
      setIsAutoPosition,
      responsive,
    }),
    [
      handleDarkModeSwitch,
      hoveredCity,
      isAutoPosition,
      isDarkTheme,
      mapPosition,
      responsive,
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
