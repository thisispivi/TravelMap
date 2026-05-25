import "./Stats.scss";

import { JSX } from "react";

import { InfoTabStats } from "../../organisms/InfoTab/InfoTabStats/InfoTabStats";

export function StatsPage(): JSX.Element {
  return (
    <section className="stats-page">
      <div className="stats-page__scroll">
        <InfoTabStats className="stats-page__content" isVisible />
      </div>
    </section>
  );
}
