import "./Stats.scss";

import { ReactNode } from "react";

import { StatsGrid } from "../../organisms/StatsGrid/StatsGrid";

/**
 * StatsPage component
 *
 * Full-page wrapper for the travel statistics dashboard. Renders the
 * `StatsGrid` bento grid with all stats visible.
 *
 * @component
 *
 * @returns {ReactNode} The stats page
 */
export function StatsPage(): ReactNode {
  return (
    <section className="stats-page">
      <StatsGrid isVisible />
    </section>
  );
}
