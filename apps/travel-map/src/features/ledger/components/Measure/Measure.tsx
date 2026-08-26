import "./Measure.scss";

import { LedgerSpan } from "@travelmap/core";
import { ReactNode } from "react";

import { useReading } from "@/shared/context/Reading.context";
import { classNames } from "@/shared/lib/classNames";

import { spanShare } from "../../lib/scale";
import { spanColor } from "../../lib/transport";

/**
 * Properties accepted by the measure.
 * @property {LedgerSpan[]} spans - The spans to draw, in travel order
 * @property {number} totalMinutes - The duration the spans are drawn against
 * @property {number} [fill] - How much of the available track the measure occupies, defaulting to all of it
 * @property {string} [name] - A view-transition name, so the same journey's measure morphs between scales
 */
interface MeasureProps {
  spans: LedgerSpan[];
  totalMinutes: number;
  fill?: number;
  name?: string;
}

/**
 * Measure component
 * Draws a run of spans to time scale: motion in its mode colour, time on the
 * ground in its country's muted colour. This is the record's one recurring
 * mark, and it is ornament only because it is also the reading — the length of
 * every segment is the time it took.
 * @component
 * @param {MeasureProps} props - The measure props
 * @param {LedgerSpan[]} props.spans - The spans to draw
 * @param {number} props.totalMinutes - The duration the spans are drawn against
 * @param {number} [props.fill=100] - How much of the track the measure occupies
 * @param {string} [props.name] - A view-transition name shared across scales
 * @returns {ReactNode} The drawn measure
 */
export function Measure({
  spans,
  totalMinutes,
  fill = 100,
  name,
}: MeasureProps): ReactNode {
  const { isDark } = useReading();

  return (
    <span
      aria-hidden="true"
      className="measure"
      style={{ viewTransitionName: name, width: `${fill}%` }}
    >
      {spans.map((span, index) => (
        <span
          className={classNames("measure__span", `measure__span--${span.kind}`)}
          key={`${span.kind}-${index}`}
          style={{
            backgroundColor: spanColor(span, isDark),
            width: `max(1px, ${spanShare(span.minutes, totalMinutes)}%)`,
          }}
        />
      ))}
    </span>
  );
}
