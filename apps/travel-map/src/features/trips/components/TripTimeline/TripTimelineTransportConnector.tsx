import "./TripTimelineTransportConnector.scss";

import { m } from "framer-motion";
import { Fragment, ReactNode } from "react";

import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatDistance } from "@/shared/lib/format";

import {
  formatTripDetailDuration,
  TransportLeg,
} from "../../lib/tripDetailTimeline";

/**
 * Properties accepted by the TimelineTransportConnector component.
 * @property {TransportLeg[]} legs - The legs
 * @property {number} animDelay - The anim delay
 */
interface TimelineTransportConnectorProps {
  legs: TransportLeg[];
  animDelay: number;
}

/**
 * TimelineTransportConnector component
 * Renders one or more transport legs as a compact connector row in the trip
 * timeline. Multiple consecutive legs (with layovers consumed) are stacked
 * vertically inside a single animated row.
 * @component
 * @param {TimelineTransportConnectorProps} props - The connector props
 * @param {TransportLeg[]} props.legs - One or more transport legs to display
 * @param {number} props.animDelay - Staggered animation delay in seconds
 * @returns {ReactNode} The transport connector row
 */
export function TimelineTransportConnector({
  legs,
  animDelay,
}: TimelineTransportConnectorProps): ReactNode {
  const { currLanguage: lang, t } = useLanguage(["home"]);

  if (!legs.length) return null;

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className="trip-route__row trip-route__row--connector"
      initial={{ opacity: 0, x: -8 }}
      transition={{
        delay: animDelay,
        duration: 0.18,
        ease: [0.35, 0, 0.25, 1],
      }}
    >
      {legs.map((leg) => {
        const fromStr = leg.from.getLocalizedName(lang);
        const toStr = leg.to.getLocalizedName(lang);
        const legKey = [
          leg.mode,
          leg.from.name,
          leg.to.name,
          leg.company ?? "",
          leg.distanceKm,
          leg.durationMinutes,
          leg.via?.map((city) => city.name).join("-") ?? "",
          leg.isRoundTrip ? "round-trip" : "one-way",
        ].join("-");
        const metaParts: string[] = [];
        if (leg.distanceKm > 0)
          metaParts.push(formatDistance(leg.distanceKm, lang));
        if (leg.durationMinutes > 0)
          metaParts.push(`~${formatTripDetailDuration(leg.durationMinutes)}`);

        const viaText =
          (leg.via?.length ?? 0) > 0
            ? `${t("tripDetail.via")} ${leg
                .via!.map((city) => city.getLocalizedName(lang))
                .join(", ")}`
            : null;

        /**
         * Represents a sub part.
         * @property {string} key - The key
         * @property {string} cls - The cls
         * @property {string} text - The text
         */
        type SubPart = { key: string; cls: string; text: string };
        const subParts: SubPart[] = [];
        if (viaText)
          subParts.push({
            key: "via",
            cls: "trip-route__connector-via",
            text: viaText,
          });
        if (leg.company)
          subParts.push({
            key: "co",
            cls: "trip-route__connector-company",
            text: leg.company,
          });
        if (metaParts.length > 0)
          subParts.push({
            key: "meta",
            cls: "trip-route__connector-meta",
            text: metaParts.join(" · "),
          });

        return (
          <Fragment key={legKey}>
            <span
              className={`trip-route__connector-icon trip-route__connector-icon--${leg.mode}`}
            >
              <TransportModeIcon
                className="trip-route__connector-icon-svg"
                mode={leg.mode}
              />
            </span>

            <div className="trip-route__connector-leg">
              <div className="trip-route__connector-route">
                <span className="trip-route__connector-from">{fromStr}</span>
                <span className="trip-route__connector-arrow">→</span>
                <span className="trip-route__connector-to">{toStr}</span>
                <CountryFlag
                  className="trip-route__connector-flag"
                  countryId={leg.to.country.id}
                />
                {leg.isRoundTrip ? (
                  <span className="trip-route__connector-roundtrip">↔</span>
                ) : null}
              </div>
              {subParts.length > 0 ? (
                <div className="trip-route__connector-sub">
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
