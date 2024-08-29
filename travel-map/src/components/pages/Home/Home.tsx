import "./Home.scss";
import { HomeTemplate } from "../../templates";
import useThemeDetector, { ThemeDetector } from "../../../hooks/style/theme";
import { createContext, useState } from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { City } from "../../../core";

export type HomeContextType = ThemeDetector & {
  hoveredCity: City | undefined;
  setHoveredCity: (city: City | undefined) => void;
};
export const HomeContext = createContext<HomeContextType | undefined>(
  undefined
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

  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("to");

  const [hoveredCity, setHoveredCity] = useState<City | undefined>(undefined);
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();
  const context = {
    isDarkTheme,
    handleDarkModeSwitch,
    hoveredCity,
    setHoveredCity,
  };

  if (redirectTo) setTimeout(() => navigate("/" + redirectTo), 300);

  return (
    <div className={`home ${isDarkTheme ? "home--dark" : "home--light"}`}>
      <HomeContext.Provider value={context}>
        <HomeTemplate>
          <Outlet />
        </HomeTemplate>
      </HomeContext.Provider>
    </div>
  );
}
