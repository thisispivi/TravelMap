import "./TimelineTransportConnector.scss";

import { m } from "framer-motion";
import { Fragment, JSX } from "react";

import { AirplaneIcon, BusIcon, CarIcon, FerryIcon, TrainIcon } from "@/assets";
import { CountryFlag } from "@/components/atoms";
import { City, TransportMode } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { formatMileage } from "@/utils/format";
import { formatTripDetailDuration } from "@/utils/tripDetailTimeline";

/** One segment of a (possibly multi-leg) transport connector row. */
export type TransportLeg = {
  mode: TransportMode;
  from: City;
  to: City;
  /** Carrier name, e.g. "Ryanair" or "Corsica Ferries". */
  company?: string;
  distanceKm: number;
  durationMinutes: number;
  /** Intermediate port or station stops (ferry layovers, etc.). */
  via?: City[];
};

interface TimelineTransportConnectorProps {
  legs: TransportLeg[];
  animDelay: number;
}

function TransportIcon({
  mode,
  className,
}: {
  mode: TransportMode;
  className?: string;
}) {
  if (mode === "plane") return <AirplaneIcon className={className} />;
  if (mode === "ferry") return <FerryIcon className={className} />;
  if (mode === "bus") return <BusIcon className={className} />;
  if (mode === "train") return <TrainIcon className={className} />;
  if (mode === "car") return <CarIcon className={className} />;
  return null;
}

/**
 * Renders one or more transport legs as a compact connector row in the trip
 * timeline. Multiple consecutive legs (with layovers consumed) are stacked
 * vertically inside a single animated row.
 */
export function TimelineTransportConnector({
  legs,
  animDelay,
}: TimelineTransportConnectorProps): JSX.Element | null {
  const { t, currLanguage: lang } = useLanguage(["home"]);

  if (!legs.length) return null;

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className="trip-detail__row trip-detail__row--connector"
      initial={{ opacity: 0, x: -8 }}
      transition={{
        delay: animDelay,
        duration: 0.18,
        ease: [0.35, 0, 0.25, 1],
      }}
    >
      {legs.map((leg, idx) => {
        const fromStr = t(`cities.${leg.from.name}`) || leg.from.name;
        const toStr = t(`cities.${leg.to.name}`) || leg.to.name;
        const metaParts: string[] = [];
        if (leg.distanceKm > 0)
          metaParts.push(`${formatMileage(leg.distanceKm, lang)} km`);
        if (leg.durationMinutes > 0)
          metaParts.push(`~${formatTripDetailDuration(leg.durationMinutes)}`);

        // Ferry (or other) via-ports shown in the secondary line
        const viaText =
          (leg.via?.length ?? 0) > 0
            ? `via ${leg.via!.map((c) => t(`cities.${c.name}`) || c.name).join(", ")}`
            : null;

        type SubPart = { key: string; cls: string; text: string };
        const subParts: SubPart[] = [];
        if (viaText)
          subParts.push({
            key: "via",
            cls: "trip-detail__connector-via",
            text: viaText,
          });
        if (leg.company)
          subParts.push({
            key: "co",
            cls: "trip-detail__connector-company",
            text: leg.company,
          });
        if (metaParts.length > 0)
          subParts.push({
            key: "meta",
            cls: "trip-detail__connector-meta",
            text: metaParts.join(" · "),
          });

        return (
          <Fragment key={`leg-${idx}`}>
            <span
              className={`trip-detail__connector-icon trip-detail__connector-icon--${leg.mode}`}
            >
              <TransportIcon
                className="trip-detail__connector-icon-svg"
                mode={leg.mode}
              />
            </span>

            <div className="trip-detail__connector-leg">
              <div className="trip-detail__connector-route">
                <span className="trip-detail__connector-from">{fromStr}</span>
                <span className="trip-detail__connector-arrow">→</span>
                <span className="trip-detail__connector-to">{toStr}</span>
                <CountryFlag
                  className="trip-detail__connector-flag"
                  countryId={leg.to.country.id}
                />
              </div>
              {subParts.length > 0 ? (
                <div className="trip-detail__connector-sub">
                  {subParts.map((p, i) => (
                    <span className={p.cls} key={p.key}>
                      {i > 0 ? `· ${p.text}` : p.text}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Fragment>
        );
      })}
    </m.div>
  );
}
