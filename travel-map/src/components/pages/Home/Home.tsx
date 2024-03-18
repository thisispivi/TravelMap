import "./Home.scss";
import { worldData } from "../../../assets";
import { HomeTemplate } from "../../templates";
import { WorldTopoJson } from "../../../typings/topojson";
import { convertTopoJsonToWorldFeaturesCollection } from "../../../utils/topojson";
import useThemeDetector, { ThemeDetector } from "../../../hooks/style/theme";
import { createContext } from "react";
import { visitedCities, visitedCountries } from "../../../data";

export const HomeContext = createContext<ThemeDetector | undefined>(undefined);

export default function Home() {
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();

  const data = worldData as WorldTopoJson;
  const features = convertTopoJsonToWorldFeaturesCollection(data);

  return (
    <div className={`home ${isDarkTheme ? "home--dark" : "home--light"}`}>
      <HomeContext.Provider value={{ isDarkTheme, handleDarkModeSwitch }}>
        <HomeTemplate
          countriesFeatures={features}
          visitedCountries={visitedCountries}
          visitedCities={visitedCities}
        />
      </HomeContext.Provider>
    </div>
  );
}
