import { Continent } from "../../../core/typings/Continent";
import useLanguage from "../../../hooks/language/language";
import Row from "./Row";
import "./RowContinentCities.scss";

interface ContinentCitiesRowProps {
  continent: Continent;
  numberOfCities: number;
}

/**
 * ContinentCitiesRow component
 *
 * The continent cities row component is used to display a row for a continent
 * with the number of cities visited.
 *
 * @component
 *
 * @param {ContinentCitiesRowProps} props - The props of the continent cities row
 * @param {Continent} props.continent - The continent to display
 * @param {number} props.numberOfCities - The number of cities visited
 * @returns {JSX.Element} - The continent cities row
 */
export default function ContinentCitiesRow({
  continent,
  numberOfCities,
}: ContinentCitiesRowProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  return (
    <Row
      className={`continent-cities-row ${numberOfCities === 0 ? "continent-cities-row--empty" : ""} continent-cities-row--${continent}`}
    >
      <div className="continent-cities-row__name">
        {t(`continents.${continent.replace(" ", "")}`)}
      </div>
      <div className="continent-cities-row__cities">{numberOfCities}</div>
    </Row>
  );
}
