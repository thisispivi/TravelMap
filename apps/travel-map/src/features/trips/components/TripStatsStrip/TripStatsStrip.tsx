import "./TripStatsStrip.scss";

import { TransportModeSchema, Trip } from "@travelmap/core";
import { ReactNode } from "react";

import CalendarIcon from "@/assets/icons/Calendar.svg?react";
import MapIcon from "@/assets/icons/Map.svg?react";
import MoonIcon from "@/assets/icons/Moon.svg?react";
import TimezoneIcon from "@/assets/icons/Timezone.svg?react";
import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatDuration, formatMileage } from "@/shared/lib/format";

import { countTimeZones } from "../../lib/tripItinerary";

/**
 * Properties accepted by the TripStatsStrip component.
 * @property {Trip} trip - The trip to summarise
 */
interface TripStatsStripProps {
  trip: Trip;
}

/**
 * TripStatsStrip component
 * The trip's numbers in one row: days, nights, distance, then one chip per
 * transport mode with its rides, kilometres, and time. Every mode used is
 * listed, walking included, so the totals add up to the whole journey.
 * @component
 * @param {TripStatsStripProps} props - The strip props
 * @param {Trip} props.trip - The trip to summarise
 * @returns {ReactNode} The statistics strip
 */
export function TripStatsStrip({ trip }: TripStatsStripProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const totals = trip.getModeTotals();
  const totalKm = Object.values(totals).reduce((sum, { km }) => sum + km, 0);
  const timeZones = countTimeZones(trip);

  return (
    <ul className="trip-stats">
      <li className="trip-stats__chip">
        <CalendarIcon aria-hidden="true" className="trip-stats__icon" />
        {t("tripDetail.daysCount", { count: trip.getDurationInDays() })}
      </li>
      <li className="trip-stats__chip">
        <MoonIcon aria-hidden="true" className="trip-stats__icon" />
        {t("tripDetail.nightsCount", { count: trip.getNights() })}
      </li>
      {totalKm > 0 ? (
        <li className="trip-stats__chip">
          <MapIcon aria-hidden="true" className="trip-stats__icon" />
          {t("tripDetail.totalDistance", {
            km: formatMileage(totalKm, lang, 0),
          })}
        </li>
      ) : null}
      {timeZones > 1 ? (
        <li className="trip-stats__chip">
          <TimezoneIcon aria-hidden="true" className="trip-stats__icon" />
          {t("tripDetail.timeZonesCount", { count: timeZones })}
        </li>
      ) : null}
      {TransportModeSchema.options.map((mode) => {
        const total = totals[mode];
        return total ? (
          <li
            className={`trip-stats__chip trip-stats__chip--${mode}`}
            key={mode}
          >
            <TransportModeIcon className="trip-stats__icon" mode={mode} />
            <span className="trip-stats__mode">
              {t(`tripDetail.mode_${mode}`, { count: total.count })}
            </span>
            <span className="trip-stats__detail">
              {formatMileage(total.km, lang, 0)} km ·{" "}
              {formatDuration(total.minutes)}
            </span>
          </li>
        ) : null;
      })}
    </ul>
  );
}
