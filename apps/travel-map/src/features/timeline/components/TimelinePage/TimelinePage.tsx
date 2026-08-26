import "./TimelinePage.scss";

import { ReactNode } from "react";

import { useLanguage } from "@/shared/hooks/useLanguage";

import { TimelineTrack } from "../TimelineTrack/TimelineTrack";

/**
 * TimelinePage component
 * The routed view for the chronological trip index. Owns the scrolling sheet
 * and its heading; the ordering and the rail itself belong to TimelineTrack.
 * @component
 * @returns {ReactNode} The timeline page
 */
export function TimelinePage(): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <section className="timeline-page">
      <div className="timeline-page__scroll">
        <h1 className="timeline-page__title">{t("timeline.title")}</h1>
        <TimelineTrack />
      </div>
    </section>
  );
}
