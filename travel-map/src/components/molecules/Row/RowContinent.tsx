import { Continent } from "../../../core/typings/Continent";
import useLanguage from "../../../hooks/language/language";
import Row from "./Row";
import "./RowContinent.scss";

interface ContinentRowProps {
  continent: Continent;
  isVisited: boolean;
}

/**
 * ContinentRow component
 *
 * The continent row component is used to display a row for a continent.
 *
 * @component
 *
 * @param {ContinentRowProps} props - The props of the continent row
 * @param {Continent} props.continent - The continent to display
 * @param {boolean} props.isVisited - Whether the continent is visited
 * @returns {JSX.Element} - The continent row
 */
export default function ContinentRow({
  continent,
  isVisited,
}: ContinentRowProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  return (
    <Row className={`continent-row continent-row--${continent}`}>
      <div className="continent-row__name">{t(`continents.${continent}`)}</div>{" "}
      <div
        className={`continent-row__circle continent-row__circle--${
          isVisited ? "visited" : "not-visited"
        }`}
      />
    </Row>
  );
}
