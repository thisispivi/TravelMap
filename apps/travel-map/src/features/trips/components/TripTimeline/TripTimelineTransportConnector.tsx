import "./TripTimelineTransportConnector.scss";

import { m } from "framer-motion";
import { Fragment, ReactNode } from "react";

import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatMileage } from "@/shared/lib/format";

import { TRANSPORT_MODE_NOUNS } from "../../lib/transportLabels";
import {
  formatTripDetailDuration,
  TransportLeg,
} from "../../lib/tripDetailTimeline";

/**
 * Properties accepted by the TimelineTransportConnector component.
 * @property {TransportLeg[]} legs - The legs
 * @property {number} animDelay - The anim delay
 * @property {boolean} showEndpoints - Whether each leg should name its cities
 */
interface TimelineTransportConnectorProps {
  legs: TransportLeg[];
  animDelay: number;
  showEndpoints: boolean;
}

/**
 * TimelineTransportConnector component
 * Renders one or more transport legs as a compact connector row in the trip
 * timeline. A leg is labelled by its mode alone where the cards around it
 * already name the places it joins, and by its endpoints where they do not.
 * @component
 * @param {TimelineTransportConnectorProps} props - The connector props
 * @param {TransportLeg[]} props.legs - One or more transport legs to display
 * @param {number} props.animDelay - Staggered animation delay in seconds
 * @param {boolean} props.showEndpoints - Whether each leg should name its cities
 * @returns {ReactNode} The transport connector row
 */
export function TimelineTransportConnector({
  legs,
  animDelay,
  showEndpoints,
}: TimelineTransportConnectorProps): ReactNode {
  const { currLanguage: lang, t } = useLanguage(["home"]);

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
      {legs.map((leg) => {
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
        const modeNoun = t(`tripDetail.${TRANSPORT_MODE_NOUNS[leg.mode].one}`);
        const lead = showEndpoints
          ? `${leg.from.getLocalizedName(lang)} → ${leg.to.getLocalizedName(lang)}`
          : modeNoun;
        const via = leg.via ?? [];
        const details = [
          via.length > 0
            ? {
                key: "via",
                text: `${t("tripDetail.via")} ${via
                  .map((city) => city.getLocalizedName(lang))
                  .join(", ")}`,
              }
            : null,
          leg.company ? { key: "company", text: leg.company } : null,
          leg.durationMinutes > 0
            ? {
                key: "duration",
                text: `~${formatTripDetailDuration(leg.durationMinutes)}`,
              }
            : null,
          leg.distanceKm > 0
            ? {
                key: "distance",
                text: `${formatMileage(leg.distanceKm, lang)} km`,
              }
            : null,
        ].filter((detail) => detail !== null);

        return (
          <Fragment key={legKey}>
            <span
              className={`trip-detail__connector-icon trip-detail__connector-icon--${leg.mode}`}
            >
              <TransportModeIcon
                className="trip-detail__connector-icon-svg"
                label={showEndpoints ? modeNoun : undefined}
                mode={leg.mode}
              />
            </span>

            <p className="trip-detail__connector-leg">
              <span className="trip-detail__connector-lead">{lead}</span>
              {leg.isRoundTrip ? (
                <span className="trip-detail__connector-roundtrip">↔</span>
              ) : null}
              {details.map((detail) => (
                <span
                  className="trip-detail__connector-detail"
                  key={detail.key}
                >
                  {detail.text}
                </span>
              ))}
            </p>
          </Fragment>
        );
      })}
    </m.div>
  );
}
