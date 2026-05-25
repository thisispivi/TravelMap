import "./Stats.scss";

import { JSX } from "react";

import { InfoTabStats } from "../../organisms/InfoTab/InfoTabStats/InfoTabStats";

/**
 * StatsPage component
 *
 * Full-page wrapper for the travel statistics dashboard. Renders the
 * `InfoTabStats` bento grid with all stats visible.
 *
 * @component
 *
 * @returns {JSX.Element} The stats page
 */
export function StatsPage(): JSX.Element {
  return (
    <section className="stats-page">
      <InfoTabStats isVisible />
    </section>
  );
}
