import "./CoverageCard.scss";

import { ReactNode } from "react";

import ContinentsIcon from "@/assets/icons/Continents.svg?react";
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
 * @returns {ReactNode} The coverage bento card
 */
export function CoverageCard({
  visitedContinents,
  allContinents,
  totalContinents,
}: CoverageCardProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const visitedSet = new Set(visitedContinents);

  const mapClassName = [
    "bento-continents__map",
    visitedSet.has(Continent.AFRICA) ? "" : "africa--not-visited",
    visitedSet.has(Continent.ASIA) ? "" : "asia--not-visited",
    visitedSet.has(Continent.EUROPE) ? "" : "europe--not-visited",
    visitedSet.has(Continent.NORTH_AMERICA) ? "" : "north-america--not-visited",
    visitedSet.has(Continent.OCEANIA) ? "" : "oceania--not-visited",
    visitedSet.has(Continent.SOUTH_AMERICA) ? "" : "south-america--not-visited",
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
              isVisited={visitedSet.has(continent)}
              key={continent}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
