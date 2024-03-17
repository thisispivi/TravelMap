import { WorldFeatureCollection } from "../../../typings/feature";
import { LeftBar, Map } from "../../organisms";

interface HomeTemplateProps {
  countriesFeatures: WorldFeatureCollection;
}

export default function HomeTemplate({ countriesFeatures }: HomeTemplateProps) {
  return (
    <div className="home-template">
      <LeftBar />
      <Map data={countriesFeatures} />
    </div>
  );
}
