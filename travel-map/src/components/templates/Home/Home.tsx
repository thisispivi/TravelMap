import { WorldFeatureCollection } from "../../../typings/feature";
import { Map } from "../../organisms";

interface HomeTemplateProps {
  countriesFeatures: WorldFeatureCollection;
}

export default function HomeTemplate({ countriesFeatures }: HomeTemplateProps) {
  return (
    <div className="home-template">
      <Map data={countriesFeatures} />
    </div>
  );
}
