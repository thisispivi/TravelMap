import { InfoTabFuture, InfoTabVisited } from "..";
import { City, Country } from "../../../core";
import { ModeHandler } from "../../../hooks/mode/mode";
import { Mode } from "../../../typings/mode";
import "./InfoTab.scss";

interface InfoTabProps {
  className?: string;
  modeHandler: ModeHandler;
  visitedCountries: Record<string, Country>;
  visitedCities: City[];
}

/**
 * InfoTab component
 *
 * The info tab component is used to display some informations on the
 * right of the left bar. It can display the future travels or the
 * visited cities and countries.
 *
 * @component
 *
 * @param {InfoTabProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab
 * @param {ModeHandler} props.modeHandler - The mode handler
 * @param {Record<string, Country>} props.visitedCountries - The visited countries
 * @param {City[]} props.visitedCities - The visited cities
 * @returns {JSX.Element} - The info tab
 */
export default function InfoTab({
  className = "",
  modeHandler,
  visitedCountries,
  visitedCities,
}: InfoTabProps): JSX.Element {
  return (
    <div
      className={`info-tab ${className} ${
        modeHandler.currMode ? "info-tab--open" : ""
      }`}
    >
      {modeHandler.currMode === Mode.FUTURE && (
        <InfoTabFuture modeHandler={modeHandler} />
      )}
      {modeHandler.currMode === Mode.VISITED && (
        <InfoTabVisited
          modeHandler={modeHandler}
          visitedCountries={visitedCountries}
          visitedCities={visitedCities}
        />
      )}
    </div>
  );
}
