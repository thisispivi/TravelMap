import "./Home.scss";
import { worldData } from "../../../assets";
import { HomeTemplate } from "../../templates";
import { WorldTopoJson } from "../../../typings/topojson";
import { convertTopoJsonToWorldFeaturesCollection } from "../../../utils/topojson";
import useThemeDetector from "../../../hooks/style/theme";

export default function Home() {
  const isDarkTheme = useThemeDetector();
  const data = worldData as WorldTopoJson;
  const features = convertTopoJsonToWorldFeaturesCollection(data);

  return (
    <div className={`home ${isDarkTheme ? "home--dark" : "home--light"}`}>
      <HomeTemplate countriesFeatures={features} />
    </div>
  );
}
