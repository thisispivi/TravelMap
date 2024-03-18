import { City, Country } from "../../../core";
import useMode from "../../../hooks/mode/mode";
import { WorldFeatureCollection } from "../../../typings/feature";
import { Mode } from "../../../typings/mode";
import { InfoTab, LeftBar, Map } from "../../organisms";

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
  const modeHandler = useMode();
  return (
    <div className="home-template">
      <LeftBar
        onFutureTravelsClick={() => modeHandler.onModeChange(Mode.FUTURE)}
        onVisitedCitiesClick={() => modeHandler.onModeChange(Mode.VISITED)}
      />
      <InfoTab modeHandler={modeHandler} />
      <Map
        data={countriesFeatures}
        visitedCountries={visitedCountries}
        visitedCities={visitedCities}
      />
    </div>
  );
}
