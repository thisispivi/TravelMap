import "./Timeline.scss";

import { ReactNode } from "react";

import { useLanguage } from "@/hooks/language/language";

import { TimelineTrack } from "../../organisms/TimelineTrack/TimelineTrack";

/**
 * TimelinePage component
 *
 * Full-page wrapper for the chronological trip timeline. Renders a scrollable
 * container with a header and the `TimelineTrack` component.
 *
 * @component
 *
 * @returns {ReactNode} The timeline page
 */
export function TimelinePage(): ReactNode {
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
