import "./Home.scss";
import { worldData } from "../../../assets";
import { HomeTemplate } from "../../templates";
import { WorldTopoJson } from "../../../typings/topojson";
import { convertTopoJsonToWorldFeaturesCollection } from "../../../utils/topojson";

export default function Home() {
  const data = worldData as WorldTopoJson;
  const features = convertTopoJsonToWorldFeaturesCollection(data);

  return (
    <div className="home">
      <HomeTemplate countriesFeatures={features} />
    </div>
  );
}
