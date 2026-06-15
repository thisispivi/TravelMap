import "./RowContinent.scss";

import { ReactNode } from "react";

import { Continent } from "../../../core";
import { useLanguage } from "../../../hooks/language/language";
import { classNames } from "../../../utils/className";
import { Row } from "./Row";

interface ContinentRowProps {
  continent: Continent;
  isVisited: boolean;
}

/**
 * ContinentRow component
 *
 * Displays a continent badge and visited state.
 *
 * @component
 *
 * @param {ContinentRowProps} props - The continent row props
 * @param {Continent} props.continent - The continent to display
 * @param {boolean} props.isVisited - Whether the continent is visited
 * @returns {ReactNode} The continent row
 */
export function ContinentRow({
  continent,
  isVisited,
}: ContinentRowProps): ReactNode {
  const { t } = useLanguage(["home"]);
  return (
    <Row className={classNames("continent-row", `continent-row--${continent}`)}>
      <div
        className={classNames(
          "continent-row__circle",
          `continent-row__circle--${isVisited ? "visited" : "not-visited"}`,
        )}
      />
      <div className="continent-row__name">{t(`continents.${continent}`)}</div>
    </Row>
  );
}
