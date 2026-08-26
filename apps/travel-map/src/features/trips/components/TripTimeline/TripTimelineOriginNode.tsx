import "./TripTimelineOriginNode.scss";

import { City } from "@travelmap/core";
import { m } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { useLanguage } from "@/shared/hooks/useLanguage";

/**
 * Properties accepted by the TimelineOriginNode component.
 * @property {City} city - The city
 * @property {number} animDelay - The anim delay
 */
interface TimelineOriginNodeProps {
  city: City;
  animDelay: number;
}

/**
 * TimelineOriginNode component
 * A labelled dot marking the origin or return endpoint of a trip in the
 * timeline. Used for both the departure and the homecoming nodes.
 * @component
 * @param {TimelineOriginNodeProps} props - The origin node props
 * @param {City} props.city - The origin/return city
 * @param {number} props.animDelay - Staggered animation delay in seconds
 * @returns {ReactNode} The origin node
 */
export function TimelineOriginNode({
  city,
  animDelay,
}: TimelineOriginNodeProps): ReactNode {
  const { currLanguage } = useLanguage(["home"]);
  const cityLabel = city.getLocalizedName(currLanguage);

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className="trip-route__row trip-route__row--origin"
      initial={{ opacity: 0, x: -8 }}
      style={{ "--dot-color": city.country.borderColor } as CSSProperties}
      transition={{
        delay: animDelay,
        duration: 0.18,
        ease: [0.35, 0, 0.25, 1],
      }}
    >
      <div className="trip-route__track">
        <div className="trip-route__origin-dot" />
      </div>
      <div className="trip-route__origin-label">
        <span className="trip-route__origin-name">{cityLabel}</span>
        <CountryFlag
          className="trip-route__origin-flag"
          countryId={city.country.id}
        />
      </div>
    </m.div>
  );
}
