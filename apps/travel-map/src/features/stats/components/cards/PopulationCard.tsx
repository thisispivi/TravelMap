import "./PopulationCard.scss";

import { City } from "@travelmap/core";
import { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { PopulationBarChart } from "../charts/BarChartPopulation";

/**
 * Props for the PopulationCard component.
 * @property {City[]} cities - All visited cities, used to derive the top-10 by population.
 */
export type PopulationCardProps = {
  cities: City[];
};

/**
 * PopulationCard component
 * Bento half-width card showing a bar chart of the top 10 most populated
 * cities visited.
 * @component
 * @param {PopulationCardProps} props
 * @param {City[]} props.cities - Cities used to calculate the population ranking
 * @returns {ReactNode} The population panel
 */
export function PopulationCard({ cities }: PopulationCardProps): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <section className="stats-panel stats-panel--half stats-block stats-population">
      <div className="stats-population__inner">
        <div className="stats-population__left">
          <h2>{t("stats.population")}</h2>
          <p className="stats-block__subtitle">{t("stats.populationTop10")}</p>
          <PopulationBarChart data={cities} />
        </div>
      </div>
    </section>
  );
}
