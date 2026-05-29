import "./TimelineDayTripCard.scss";

import { m } from "framer-motion";
import { CSSProperties, JSX, use } from "react";
import {
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router-dom";

import { CountryFlag } from "@/components/atoms";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { City, TransportMode, TripStop } from "@/core";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { classNames } from "@/utils/className";
import { formatMileage } from "@/utils/format";
import { formatTripDetailDuration } from "@/utils/tripDetailTimeline";
import { getPhotoTravelIndex } from "@/utils/trips";

interface TimelineDayTripCardProps {
  city: City;
  travelIdx: number;
  stop: TripStop;
  animDelay: number;
  showYear: boolean;
  isNested: boolean;
  inboundTransport?: {
    mode: TransportMode;
    distanceKm: number;
    durationMinutes: number;
  };
}

/**
 * TimelineDayTripCard component
 *
 * A compact card for a day-trip or excursion stop in the trip timeline.
 * Optionally shows inbound transport details when the excursion requires
 * its own travel (nested day trip).
 *
 * @component
 *
 * @param {TimelineDayTripCardProps} props - The day trip card props
 * @param {City} props.city - The excursion destination
 * @param {number} props.travelIdx - Visit index for the background image
 * @param {TripStop} props.stop - Stop metadata (dates, photos)
 * @param {number} props.animDelay - Staggered animation delay in seconds
 * @param {boolean} props.showYear - Whether to include the year in date labels
 * @param {boolean} props.isNested - Whether this card is nested under a parent stay
 * @param {{ mode, distanceKm, durationMinutes }} [props.inboundTransport] - Inbound leg details
 * @returns {JSX.Element} The day trip card
 */
export function TimelineDayTripCard({
  city,
  travelIdx,
  stop,
  animDelay,
  showYear,
  isNested,
  inboundTransport,
}: TimelineDayTripCardProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { setHoveredCity } = use(HomeContext)!;

  const galleryTravelIdx = getPhotoTravelIndex(city, stop.sDate, visitedTrips);
  const isClickable = galleryTravelIdx >= 0;
  const thumbSrc = city.getBackgroundImgSourceByIndex(
    isClickable ? galleryTravelIdx : travelIdx,
  );
  const cityLabel = t(`cities.${city.name}`) || city.name;

  const dateRange = formatDateRangeShort({
    sDateInput: stop.sDate,
    eDateInput: stop.eDate,
    locale: lang,
    showYear,
  });

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className="trip-detail__row trip-detail__row--day-trip"
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
        <div className="trip-detail__day-trip-dot" />
      </div>

      <div
        className={classNames(
          "trip-detail__day-trip-card",
          isClickable && "trip-detail__day-trip-card--clickable",
          isNested && "trip-detail__day-trip-card--nested",
        )}
        onClick={
          isClickable
            ? () =>
                navigate(`/gallery/${city.name}/${galleryTravelIdx}`, {
                  state: {
                    fromPath: `${routerLocation.pathname}${routerLocation.search}`,
                  },
                })
            : undefined
        }
        onMouseEnter={() => setHoveredCity(city)}
        onMouseLeave={() => setHoveredCity(null)}
        {...(isClickable ? { role: "button" as const, tabIndex: 0 } : {})}
      >
        <div className="trip-detail__day-trip-thumb">
          {thumbSrc ? (
            <img
              alt={cityLabel}
              className="trip-detail__day-trip-thumb-img"
              src={thumbSrc}
            />
          ) : (
            <div className="trip-detail__day-trip-thumb-empty" />
          )}
        </div>

        <div className="trip-detail__day-trip-body">
          <div className="trip-detail__day-trip-header">
            <span className="trip-detail__day-trip-name">{cityLabel}</span>
            <CountryFlag
              className="trip-detail__day-trip-flag"
              countryId={city.country.id}
            />
          </div>
          <span className="trip-detail__day-trip-meta">
            <span className="trip-detail__day-trip-date">{dateRange}</span>
            {inboundTransport &&
            (inboundTransport.distanceKm > 0 ||
              inboundTransport.durationMinutes > 0) ? (
              <span className="trip-detail__day-trip-transport">
                {inboundTransport.distanceKm > 0
                  ? ` · ${formatMileage(inboundTransport.distanceKm, lang)} km`
                  : null}
                {inboundTransport.durationMinutes > 0
                  ? ` · ${formatTripDetailDuration(inboundTransport.durationMinutes)}`
                  : null}
              </span>
            ) : null}
          </span>
        </div>
      </div>
    </m.div>
  );
}
