import { m } from "framer-motion";
import { CSSProperties, JSX } from "react";

import { CountryFlag } from "@/components/atoms";
import { City } from "@/core";
import { useLanguage } from "@/hooks/language/language";

interface TripDetailTimelineGhostRowProps {
  city: City;
  animDelay: number;
}

export function TripDetailTimelineGhostRow({
  city,
  animDelay,
}: TripDetailTimelineGhostRowProps): JSX.Element {
  const { t } = useLanguage(["home"]);
  const cityLabel = t(`cities.${city.name}`) || city.name;

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className="trip-detail__row trip-detail__row--ghost"
      initial={{ opacity: 0, x: -8 }}
      style={
        {
          "--dot-color": city.country.borderColor,
          "--dot-color-faint": city.country.fillColor,
        } as CSSProperties
      }
      transition={{
        delay: animDelay,
        duration: 0.18,
        ease: [0.35, 0, 0.25, 1],
      }}
    >
      <div className="trip-detail__track">
        <div className="trip-detail__dot trip-detail__dot--ghost" />
      </div>
      <div className="trip-detail__ghost-card">
        <span className="trip-detail__ghost-name">{cityLabel}</span>
        <CountryFlag
          className="trip-detail__ghost-flag"
          countryId={city.country.id}
        />
      </div>
    </m.div>
  );
}
