import "./Stats.scss";

import { JSX } from "react";

import { StatsGrid } from "../../organisms/StatsGrid/StatsGrid";

/**
 * StatsPage component
 *
 * Full-page wrapper for the travel statistics dashboard. Renders the
 * `StatsGrid` bento grid with all stats visible.
 *
 * @component
 *
 * @returns {JSX.Element} The stats page
 */
export function StatsPage(): JSX.Element {
  return (
    <section className="stats-page">
      <StatsGrid isVisible />
    </section>
  );
}
