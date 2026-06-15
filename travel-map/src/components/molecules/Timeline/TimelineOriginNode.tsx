import "./TimelineOriginNode.scss";

import { m } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

import { CountryFlag } from "@/components/atoms";
import { City } from "@/core";
import { useLanguage } from "@/hooks/language/language";

interface TimelineOriginNodeProps {
  city: City;
  animDelay: number;
}

/**
 * TimelineOriginNode component
 *
 * A labelled dot marking the origin or return endpoint of a trip in the
 * timeline. Used for both the departure and the homecoming nodes.
 *
 * @component
 *
 * @param {TimelineOriginNodeProps} props - The origin node props
 * @param {City} props.city - The origin/return city
 * @param {number} props.animDelay - Staggered animation delay in seconds
 * @returns {ReactNode} The origin node
 */
export function TimelineOriginNode({
  city,
  animDelay,
}: TimelineOriginNodeProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const cityLabel = t(`cities.${city.name}`) || city.name;

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className="trip-detail__row trip-detail__row--origin"
      initial={{ opacity: 0, x: -8 }}
      style={{ "--dot-color": city.country.borderColor } as CSSProperties}
      transition={{
        delay: animDelay,
        duration: 0.18,
        ease: [0.35, 0, 0.25, 1],
      }}
    >
      <div className="trip-detail__track">
        <div className="trip-detail__origin-dot" />
      </div>
      <div className="trip-detail__origin-label">
        <span className="trip-detail__origin-name">{cityLabel}</span>
        <CountryFlag
          className="trip-detail__origin-flag"
          countryId={city.country.id}
        />
      </div>
    </m.div>
  );
}
