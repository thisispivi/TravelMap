import "./Ledger.scss";

import { ReactNode, useEffect, useRef } from "react";

import { readingOrder, record, totalFigures } from "@/data/record";
import { siteConfig } from "@/data/world";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { useReading } from "@/shared/context/Reading.context";
import { useLanguage } from "@/shared/hooks/useLanguage";

import { toHours } from "../../lib/duration";
import { JourneyBar } from "../JourneyBar/JourneyBar";

/**
 * Ledger component
 * The record read whole: every journey in travel order, each drawn to the same
 * time scale. It is the application's opening position because the archive has
 * no summary worth showing before the thing it summarises.
 * @component
 * @returns {ReactNode} The record at its widest scale
 */
export function Ledger(): ReactNode {
  const { currLanguage, t } = useLanguage(["record"]);
  const { setFigures, setLocus } = useReading();
  const journeysRef = useRef<HTMLOListElement>(null);
  const reportedRef = useRef(-1);
  const firstYear = record[0]?.year;
  const lastYear = record[record.length - 1]?.year;
  const daysAway = Math.round(
    (totalFigures.minutesInMotion + totalFigures.minutesAtRest) / (60 * 24),
  );
  const motionShare = Math.round(
    (totalFigures.minutesInMotion /
      Math.max(1, totalFigures.minutesInMotion + totalFigures.minutesAtRest)) *
      100,
  );

  /* Reading the record whole means the plate should show the whole record, so
     leaving any one journey's bar clears the reading rather than keeping the
     last one framed. */
  useEffect(() => {
    setLocus(null);
    /* The record opens on the newest journey, where the running totals are the
       whole archive. Without this, arriving back from a journey would keep that
       journey's smaller totals on screen until the first scroll. */
    setFigures(totalFigures);
  }, [setFigures, setLocus]);

  /* The figures band reports the archive as it stood at the point being read,
     so the record watches which journey has reached the top of the column and
     hands its cumulative totals to the band. */
  useEffect(() => {
    const list = journeysRef.current;
    if (!list) return;
    const rows = [...list.children];
    const passed = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = rows.indexOf(entry.target);
          if (index < 0) continue;
          if (entry.isIntersecting) passed.add(index);
          else passed.delete(index);
        }
        const reached = passed.size > 0 ? Math.max(...passed) : -1;
        const at = reached < 0 ? 0 : reached;
        if (at === reportedRef.current) return;
        reportedRef.current = at;
        setFigures(readingOrder[at]?.running ?? totalFigures);
      },
      { root: list.closest(".record__ledger"), rootMargin: "0px 0px -80% 0px" },
    );
    for (const row of rows) observer.observe(row);
    return () => observer.disconnect();
  }, [setFigures]);

  if (record.length === 0) {
    return (
      <article className="ledger ledger--empty">
        <h1 className="ledger__name">
          {siteConfig?.site?.name ?? t("record:untitled")}
        </h1>
        <EmptyState message={t("record:noJourneys")} />
      </article>
    );
  }

  return (
    <article className="ledger">
      <header className="ledger__head">
        <h1 className="ledger__name">
          {siteConfig?.site?.name ?? t("record:untitled")}
        </h1>
        <p className="ledger__thesis">
          {t("record:thesis", {
            days: daysAway,
            from: firstYear,
            km: Math.round(totalFigures.distanceKm).toLocaleString(
              currLanguage,
            ),
            hours: toHours(totalFigures.minutesInMotion),
            share: motionShare,
            to: lastYear,
          })}
        </p>
      </header>
      <ol className="ledger__journeys" ref={journeysRef}>
        {readingOrder.map((journey, index) => (
          <li className="ledger__journey" key={journey.entry.trip.id}>
            {journey.year !== readingOrder[index - 1]?.year ? (
              <p className="ledger__year figure">{journey.year}</p>
            ) : null}
            <JourneyBar journey={journey} />
          </li>
        ))}
      </ol>
    </article>
  );
}
