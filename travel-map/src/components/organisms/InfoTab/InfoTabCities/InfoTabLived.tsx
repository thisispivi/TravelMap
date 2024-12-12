import { memo } from "react";
import "./InfoTabLived.scss";
import { livedCities, livedCountries } from "../../../../data";
import InfoTabCities from "./InfoTabCities";

interface InfoTabLivedProps {
  className?: string;
  isVisible?: boolean;
}

/**
 * InfoTabLived component
 *
 * The info tab lived component is used to display the cities in which I lived.
 *
 * @component
 *
 * @param {InfoTabLivedProps} props - The props of the component
 * @param {string} props.className - The class to apply to the info tab lived
 * @param {ModeHandler} props.modeHandler - The mode handler
 * @param {boolean} props.isVisible - The visibility of the info tab lived
 * @returns {JSX.Element} - The info tab lived
 */
export default memo(function InfoTabLived({
  className = "",
  isVisible = false,
}: InfoTabLivedProps): JSX.Element {
  return (
    <InfoTabCities
      allCountries={livedCountries}
      cities={livedCities}
      className={className}
      getTravelIdx={() => 0}
      id="lived"
      isVisible={isVisible}
    />
  );
});
