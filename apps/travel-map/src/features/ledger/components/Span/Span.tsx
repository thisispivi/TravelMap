import "./Span.scss";

import { LedgerSpan } from "@travelmap/core";
import { ReactNode } from "react";
import { Link } from "react-router";

import { spanCities } from "@/data/record";
import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useReading } from "@/shared/context/Reading.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";

import { readCarrier } from "../../lib/carriers";
import { writeDuration } from "../../lib/duration";
import { rowHeight, tickHeight } from "../../lib/scale";
import { spanColor } from "../../lib/transport";

/* A stay's row is as tall as the stay was long, so its contact sheet is sized
   to fill it: six days in Kyoto earns a sheet, an eight-hour visit earns a
   strip. The cap keeps a very long stay from rendering hundreds of nodes. */
const THUMB_SIZE_PX = 54;
const THUMB_COLUMNS = 7;
const MAX_THUMBS = 96;

/**
 * Properties accepted by a span row.
 * @property {LedgerSpan} span - The span to draw
 * @property {number} index - The span's position in its journey
 * @property {string} tripId - The journey the span belongs to
 */
interface SpanProps {
  span: LedgerSpan;
  index: number;
  tripId: string;
}

/**
 * Span component
 * One row of a journey: either time spent somewhere or time spent moving. The
 * row keeps a height a thumb can hit, while the tick in its gutter stays true
 * to the time — which is how a ninety-minute layover can sit legibly inside a
 * forty-four pixel row without the record pretending it lasted that long.
 * @component
 * @param {SpanProps} props - The span props
 * @param {LedgerSpan} props.span - The span to draw
 * @param {number} props.index - The span's position in its journey
 * @param {string} props.tripId - The journey the span belongs to
 * @returns {ReactNode} The span row
 */
export function Span({ span, index, tripId }: SpanProps): ReactNode {
  const { currLanguage, t } = useLanguage(["record"]);
  const { isDark, setLocus } = useReading();

  /**
   * Points the plate at what this row refers to.
   * @returns {void}
   */
  const aim = (): void => {
    setLocus({
      cities: spanCities(span),
      route:
        span.kind === "passage"
          ? [span.from.coordinates, span.to.coordinates]
          : undefined,
    });
  };

  const carrier = span.kind === "passage" ? readCarrier(span.company) : null;
  const sheetSize = Math.min(
    MAX_THUMBS,
    Math.ceil(rowHeight(span) / THUMB_SIZE_PX) * THUMB_COLUMNS,
  );

  const body =
    span.kind === "passage" ? (
      <>
        <span className="span__mode">
          <TransportModeIcon className="span__icon" mode={span.mode} />
          {t(`record:mode.${span.mode}`)}
        </span>
        <span className="span__route">
          {span.from.getLocalizedName(currLanguage)} →{" "}
          {span.to.getLocalizedName(currLanguage)}
        </span>
        <span className="span__reading figure">
          {writeDuration(span.minutes)}
          {span.isEstimated ? "*" : ""}
          <span className="span__separator">·</span>
          {Math.round(span.distanceKm).toLocaleString(currLanguage)} km
        </span>
        {carrier ? (
          <span className="span__carrier">
            {carrier.logoUrl ? (
              <img alt="" className="span__logo" src={carrier.logoUrl} />
            ) : null}
            {carrier.name}
          </span>
        ) : null}
      </>
    ) : (
      <>
        <span className="span__line">
          <Link
            className="span__place"
            to={`/place/${encodeURIComponent(span.city.id)}`}
            viewTransition
          >
            {span.city.getLocalizedName(currLanguage)}
          </Link>
          {span.isLayover ? (
            <span className="span__note">{t("record:passedThrough")}</span>
          ) : null}
          <span className="span__reading figure">
            {writeDuration(span.minutes)}
            {span.isEstimated ? "*" : ""}
          </span>
        </span>
        {span.photos.length > 0 ? (
          <Link
            className="span__photos"
            to={`/journey/${tripId}/${index}`}
            viewTransition
          >
            <span className="span__sheet">
              {span.photos.slice(0, sheetSize).map((photo, photoIndex) => (
                <img
                  alt={photo.alt ?? ""}
                  className="span__thumb"
                  key={`${photo.thumbnail}-${photoIndex}`}
                  loading="lazy"
                  src={photo.thumbnail}
                />
              ))}
            </span>
            <span className="span__count figure">
              {t("record:photographs", { count: span.photos.length })}
            </span>
          </Link>
        ) : null}
      </>
    );

  return (
    <li
      className={classNames(
        "span",
        `span--${span.kind}`,
        span.kind === "stay" && span.isLayover && "span--layover",
      )}
      onBlur={() => setLocus(null)}
      onFocus={aim}
      onPointerEnter={aim}
      onPointerLeave={() => setLocus(null)}
      style={{ minHeight: `${rowHeight(span)}px` }}
    >
      <span className="span__gutter">
        <span
          className="span__tick"
          style={{
            backgroundColor: spanColor(span, isDark),
            height: `${tickHeight(span)}px`,
          }}
        />
      </span>
      <span className="span__body">{body}</span>
    </li>
  );
}
