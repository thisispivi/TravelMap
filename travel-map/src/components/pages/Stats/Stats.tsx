import "./Stats.scss";

import { JSX } from "react";

import { useThemeDetector } from "@/hooks/style/theme";

import { FloatingNav } from "../../organisms/FloatingNav/FloatingNav";
import { InfoTabStats } from "../../organisms/InfoTab/InfoTabStats/InfoTabStats";

export function StatsPage(): JSX.Element {
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();

  return (
    <div className={`stats-page ${isDarkTheme ? "home--dark" : "home--light"}`}>
      <FloatingNav
        handleDarkModeSwitch={handleDarkModeSwitch}
        isDarkTheme={isDarkTheme}
      />
      <div className="stats-page__scroll">
        <InfoTabStats className="stats-page__content" isVisible />
      </div>
    </div>
  );
}
