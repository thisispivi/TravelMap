import "./Rail.scss";

import { ReactNode } from "react";
import { Link } from "react-router";

import { readingOrder, spanTotal, stayedCities } from "@/data/record";
import { useReading } from "@/shared/context/Reading.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";

import { spanColor } from "../../lib/transport";

/**
 * Properties accepted by the rail.
 * @property {string | null} tripId - The journey being read, so the rail can mark it
 */
interface RailProps {
  tripId: string | null;
}

/**
 * Rail component
 * The whole archive as one continuous measure, always at the same scale and
 * always present. It never re-scopes to what is being read: it is the constant
 * the rest of the application is read against, and it marks the reader's place
 * in it. Every segment is a link, so it doubles as the fastest index in the
 * record once its shape is familiar.
 * @component
 * @param {RailProps} props - The rail props
 * @param {string | null} props.tripId - The journey being read
 * @returns {ReactNode} The measure rail
 */
export function Rail({ tripId }: RailProps): ReactNode {
  const { currLanguage, t } = useLanguage(["record"]);
  const { isDark, setLocus } = useReading();

  return (
    <nav aria-label={t("record:railLabel")} className="rail">
      {readingOrder.map((journey) => {
        const { entry } = journey;
        const isHere = entry.trip.id === tripId;
        return (
          <Link
            aria-current={isHere ? "page" : undefined}
            className={classNames(
              "rail__journey",
              isHere && "rail__journey--here",
            )}
            key={entry.trip.id}
            onBlur={() => setLocus(null)}
            onFocus={() =>
              setLocus({
                cities: stayedCities(entry),
                route: entry.trip.getRouteLines(),
              })
            }
            onPointerEnter={() =>
              setLocus({
                cities: stayedCities(entry),
                route: entry.trip.getRouteLines(),
              })
            }
            onPointerLeave={() => setLocus(null)}
            style={{ flexGrow: spanTotal(entry) }}
            to={`/journey/${entry.trip.id}`}
            viewTransition
          >
            <span className="rail__label">
              {entry.trip.getLocalizedTitle(currLanguage)}
            </span>
            {entry.spans.map((span, index) => (
              <span
                className="rail__span"
                key={`${span.kind}-${index}`}
                style={{
                  backgroundColor: spanColor(span, isDark),
                  flexGrow: span.minutes,
                }}
              />
            ))}
          </Link>
        );
      })}
    </nav>
  );
}
