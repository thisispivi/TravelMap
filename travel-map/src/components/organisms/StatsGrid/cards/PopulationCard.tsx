import "./PopulationCard.scss";

import { JSX } from "react";

import { City } from "@/core";
import { useLanguage } from "@/hooks/language/language";

import { PopulationBarChart } from "../../../atoms";
import { Card } from "../../../molecules/Cards/Card";

/**
 * Props for the PopulationCard component.
 *
 * @property {City[]} cities - All visited cities, used to derive the top-10 by population.
 */
export type PopulationCardProps = {
  cities: City[];
};

/**
 * PopulationCard component
 *
 * Bento half-width card showing a bar chart of the top 10 most populated
 * cities visited.
 *
 * @component
 *
 * @param {PopulationCardProps} props
 * @returns {JSX.Element} The population bento card
 */
export function PopulationCard({ cities }: PopulationCardProps): JSX.Element {
  const { t } = useLanguage(["home"]);

  return (
    <Card className="bento-card bento-card--half bento-detail bento-population card--box-shadow">
      <div className="bento-population__inner">
        <div className="bento-population__left">
          <h2>{t("stats.population")}</h2>
          <p className="bento-detail__subtitle">{t("stats.populationTop10")}</p>
          <PopulationBarChart data={cities} />
        </div>
      </div>
    </Card>
  );
}
