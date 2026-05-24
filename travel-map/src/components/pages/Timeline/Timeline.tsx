import "./Timeline.scss";

import { JSX } from "react";

import { useLanguage } from "@/hooks/language/language";
import { useThemeDetector } from "@/hooks/style/theme";

import { FloatingNav } from "../../organisms/FloatingNav/FloatingNav";
import { TimelineTrack } from "../../organisms/TimelineTrack/TimelineTrack";

export function TimelinePage(): JSX.Element {
  const { t } = useLanguage(["home"]);
  const { isDarkTheme, handleDarkModeSwitch } = useThemeDetector();

  return (
    <div
      className={`timeline-page ${isDarkTheme ? "home--dark" : "home--light"}`}
    >
      <FloatingNav
        handleDarkModeSwitch={handleDarkModeSwitch}
        isDarkTheme={isDarkTheme}
      />
      <div className="timeline-page__scroll">
        <div className="timeline-page__header">
          <h1>{t("timeline.title")}</h1>
        </div>
        <TimelineTrack />
      </div>
    </div>
  );
}
