import { City, Country } from "../../../core";
import { WorldFeatureCollection } from "../../../typings/feature";
import { LeftBar, Map } from "../../organisms";

interface HomeTemplateProps {
  countriesFeatures: WorldFeatureCollection;
  visitedCountries: Record<string, Country>;
  visitedCities: City[];
}

export default function HomeTemplate({
  countriesFeatures,
  visitedCountries,
  visitedCities,
}: HomeTemplateProps) {
  return (
    <div className="home-template">
      <LeftBar />
      <Map
        data={countriesFeatures}
        visitedCountries={visitedCountries}
        visitedCities={visitedCities}
      />
    </div>
  );
}
