import "./Home.scss";
import { worldData } from "../../../assets";
import { HomeTemplate } from "../../templates";
import { WorldTopoJson } from "../../../typings/topojson";
import { convertTopoJsonToWorldFeaturesCollection } from "../../../utils/topojson";
import useThemeDetector, { ThemeDetector } from "../../../hooks/style/theme";
import { createContext, useState } from "react";
import {
  futureCities,
  futureCountries,
  visitedCities,
  visitedCountries,
} from "../../../data";
import { City } from "../../../core";

export type HomeContextType = ThemeDetector;
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
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();
  const [currHoveredCity, setCurrHoveredCity] = useState<City | null>(null);
  const context = {
    isDarkTheme,
    handleDarkModeSwitch,
    currHoveredCity,
    setCurrHoveredCity,
  };

  const data = worldData as WorldTopoJson;
  const features = convertTopoJsonToWorldFeaturesCollection(data);

  return (
    <div className={`home ${isDarkTheme ? "home--dark" : "home--light"}`}>
      <HomeContext.Provider value={context}>
        <HomeTemplate
          countriesFeatures={features}
          visitedCountries={visitedCountries}
          visitedCities={visitedCities}
          futureCities={futureCities}
          futureCountries={futureCountries}
        />
      </HomeContext.Provider>
    </div>
  );
}
