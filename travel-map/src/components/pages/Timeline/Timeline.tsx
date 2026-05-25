import "./Timeline.scss";

import { JSX } from "react";

import { useLanguage } from "@/hooks/language/language";

import { TimelineTrack } from "../../organisms/TimelineTrack/TimelineTrack";

export function TimelinePage(): JSX.Element {
  const { t } = useLanguage(["home"]);

  return (
    <section className="timeline-page">
      <div className="timeline-page__scroll">
        <div className="timeline-page__header">
          <h1>{t("timeline.title")}</h1>
        </div>
        <TimelineTrack />
      </div>
    </section>
  );
}
