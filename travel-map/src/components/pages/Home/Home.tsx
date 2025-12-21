import "./Home.scss";
import { HomeTemplate } from "../../templates";
import useThemeDetector, { ThemeDetector } from "@/hooks/style/theme";
import { createContext, JSX, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { City } from "@/core";
import { parameters } from "@/utils/parameters";
import useResponsive, { ResponsiveType } from "@/hooks/style/responsive";
import { isMobile, isTablet } from "mobile-device-detect";

export type HomeContextType = ThemeDetector & {
  hoveredCity: City | null;
  setHoveredCity: (city: City | null) => void;
  mapPosition: { center: [number, number]; zoom: number };
  setMapPosition: (position: {
    center: [number, number];
    zoom: number;
  }) => void;
  isAutoPosition: boolean;
  setIsAutoPosition: (isAutoPosition: boolean) => void;
  responsive: ResponsiveType;
};
export const HomeContext = createContext<HomeContextType | undefined>(
  undefined,
);

/**
 * Home component
 *
 * The home component is the main component of the application. It is used to display the map and the left bar.
 *
 * @component
 *
 * @returns {JSX.Element} - The home
 */
export default function Home(): JSX.Element {
  const navigate = useNavigate();
  const responsive = useResponsive();

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("to");

  const [isAutoPosition, setIsAutoPosition] = useState<boolean>(false);

  const [mapPosition, setMapPosition] = useState({
    center: parameters.map.defaultCenter,
    zoom: parameters.map.defaultZoom,
  });

  const [hoveredCity, setHoveredCity] = useState<City | null>(null);

  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();

  useEffect(() => {
    if (!redirectTo) return;
    const timeout = window.setTimeout(() => navigate("/" + redirectTo), 300);
    return () => window.clearTimeout(timeout);
  }, [navigate, redirectTo]);

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
