import "./CoverageCard.scss";

import { JSX } from "react";

import { ContinentsIcon } from "@/assets";
import { Continent } from "@/core";
import { useLanguage } from "@/hooks/language/language";

import { Card } from "../../../molecules/Cards/Card";
import { ContinentRow } from "../../../molecules/Row/RowContinent";

/**
 * Props for the CoverageCard component.
 *
 * @property {Continent[]} visitedContinents - Continents the user has visited.
 * @property {Continent[]} allContinents - All possible continents.
 * @property {number} totalContinents - Total number of continents in the world.
 */
export type CoverageCardProps = {
  visitedContinents: Continent[];
  allContinents: Continent[];
  totalContinents: number;
};

/**
 * CoverageCard component
 *
 * Bento detail card showing continent coverage: a world-continent SVG map
 * with unvisited continents grayed out, a visited/total score, and a badge
 * row listing each continent's visited status.
 *
 * @component
 *
 * @param {CoverageCardProps} props
 * @returns {JSX.Element} The coverage bento card
 */
export function CoverageCard({
  visitedContinents,
  allContinents,
  totalContinents,
}: CoverageCardProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  const mapClassName = [
    "bento-continents__map",
    visitedContinents.includes(Continent.AFRICA) ? "" : "africa--not-visited",
    visitedContinents.includes(Continent.ASIA) ? "" : "asia--not-visited",
    visitedContinents.includes(Continent.EUROPE) ? "" : "europe--not-visited",
    visitedContinents.includes(Continent.NORTH_AMERICA)
      ? ""
      : "north-america--not-visited",
    visitedContinents.includes(Continent.OCEANIA) ? "" : "oceania--not-visited",
    visitedContinents.includes(Continent.SOUTH_AMERICA)
      ? ""
      : "south-america--not-visited",
  ]
    .join(" ")
    .trim();

  return (
    <Card className="bento-card bento-card--medium bento-detail bento-continents card--box-shadow">
      <div className="bento-continents__body">
        <div className="bento-continents__header">
          <h2>{t("stats.coverage")}</h2>
          <div className="bento-continents__score">
            <b>{visitedContinents.length}</b>
            <span>/ {totalContinents}</span>
          </div>
        </div>
        <ContinentsIcon className={mapClassName} />
        <div className="bento-continents__badges">
          {allContinents.map((continent) => (
            <ContinentRow
              continent={continent}
              isVisited={visitedContinents.includes(continent)}
              key={continent}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
