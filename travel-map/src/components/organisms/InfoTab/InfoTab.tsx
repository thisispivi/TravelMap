import { memo } from "react";
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
  futureCountries: Record<string, Country>;
  futureCities: City[];
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
 * @param {Record<string, Country>} props.futureCountries - The future countries
 * @param {City[]} props.futureCities - The future cities
 * @returns {JSX.Element} - The info tab
 */
export default memo(function InfoTab({
  className = "",
  modeHandler,
  visitedCountries,
  visitedCities,
  futureCountries,
  futureCities,
}: InfoTabProps): JSX.Element {
  return (
    <div
      className={`info-tab ${className} ${
        modeHandler.currMode ? "info-tab--open" : ""
      }`}
    >
      {modeHandler.currMode === Mode.FUTURE && (
        <InfoTabFuture
          modeHandler={modeHandler}
          futureCountries={futureCountries}
          futureCities={futureCities}
        />
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
});
