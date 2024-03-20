import { memo } from "react";
import { City, Country } from "../../../core";
import useMode from "../../../hooks/mode/mode";
import { WorldFeatureCollection } from "../../../typings/feature";
import { Mode } from "../../../typings/mode";
import { InfoTab, LeftBar, Map } from "../../organisms";

interface HomeTemplateProps {
  countriesFeatures: WorldFeatureCollection;
  visitedCountries: Record<string, Country>;
  visitedCities: City[];
  futureCountries: Record<string, Country>;
  futureCities: City[];
}

/**
 * HomeTemplate component
 *
 * The home template component is used to display the home page.
 *
 * @component
 *
 * @param {HomeTemplateProps} props - The props of the component
 * @param {WorldFeatureCollection} props.countriesFeatures - The countries features
 * @param {Record<string, Country>} props.visitedCountries - The visited countries
 * @param {City[]} props.visitedCities - The visited cities
 * @param {Record<string, Country>} props.futureCountries - The future countries
 * @param {City[]} props.futureCities - The future cities
 * @returns {JSX.Element} - The home template
 */
export default memo(function HomeTemplate(
  props: HomeTemplateProps
): JSX.Element {
  const modeHandler = useMode();
  return (
    <div className="home-template">
      <LeftBar
        currMode={modeHandler.currMode}
        onFutureTravelsClick={() => modeHandler.onModeChange(Mode.FUTURE)}
        onVisitedCitiesClick={() => modeHandler.onModeChange(Mode.VISITED)}
      />
      <InfoTab {...props} modeHandler={modeHandler} />
      <Map data={props.countriesFeatures} {...props} />
    </div>
  );
});
