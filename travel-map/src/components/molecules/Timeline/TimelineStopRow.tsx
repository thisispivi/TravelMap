import "./TimelineStopRow.scss";

import { m } from "framer-motion";
import { CSSProperties, JSX, use } from "react";
import {
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router-dom";

import { MoonIcon } from "@/assets";
import { CountryFlag } from "@/components/atoms";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { City, TripStop } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { classNames } from "@/utils/className";

interface TimelineStopRowProps {
  city: City;
  travelIdx: number;
  stop: TripStop;
  nights: number;
  isLayover: boolean;
  animDelay: number;
  showYear: boolean;
}

/**
 * TimelineStopRow component
 *
 * Renders a multi-day city stop on the timeline. Shows a city thumbnail,
 * name, country flag, date range, and a night-count badge. Layover stops
 * render with reduced opacity and no thumbnail. Clickable when the stop
 * has photos — navigates to the city gallery.
 *
 * @component
 *
 * @param {TimelineStopRowProps} props
 * @param {City} props.city - The stop city
 * @param {number} props.travelIdx - Index of this visit within the city (for multi-visit cities)
 * @param {TripStop} props.stop - Raw stop data with dates and photo list
 * @param {number} props.nights - Number of nights spent at this stop
 * @param {boolean} props.isLayover - Whether this is a transit/layover stop
 * @param {number} props.animDelay - Framer Motion entrance delay in seconds
 * @param {boolean} props.showYear - Whether date ranges include the year
 * @returns {JSX.Element} The stop row
 */
export function TimelineStopRow({
  city,
  travelIdx,
  stop,
  nights,
  isLayover,
  animDelay,
  showYear,
}: TimelineStopRowProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { setHoveredCity } = use(HomeContext)!;

  const thumbSrc = city.getBackgroundImgSourceByIndex(travelIdx);
  const hasPhotos = Boolean(!isLayover && stop.photos && stop.photos.length > 0);
  const cityLabel = t(`cities.${city.name}`) || city.name;

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className={classNames(
        "trip-detail__row trip-detail__row--stop",
        isLayover && "trip-detail__row--layover",
      )}
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
        <div
          className={classNames(
            "trip-detail__dot",
            isLayover && "trip-detail__dot--layover",
          )}
        />
      </div>

      <div
        className={classNames(
          "trip-detail__stop-card",
          hasPhotos && "trip-detail__stop-card--clickable",
          isLayover && "trip-detail__stop-card--layover",
        )}
        onClick={
          hasPhotos
            ? () =>
                navigate(`/gallery/${city.name}/${travelIdx}`, {
                  state: {
                    fromPath: `${routerLocation.pathname}${routerLocation.search}`,
                  },
                })
            : undefined
        }
        onMouseEnter={!isLayover ? () => setHoveredCity(city) : undefined}
        onMouseLeave={!isLayover ? () => setHoveredCity(null) : undefined}
        {...(hasPhotos ? { role: "button" as const, tabIndex: 0 } : {})}
      >
        {!isLayover ? (
          <div className="trip-detail__stop-thumb">
            {thumbSrc ? (
              <img
                alt={cityLabel}
                className="trip-detail__stop-thumb-img"
                src={thumbSrc}
              />
            ) : (
              <div className="trip-detail__stop-thumb-empty" />
            )}
          </div>
        ) : null}

        <div className="trip-detail__stop-info">
          <div className="trip-detail__stop-top">
            <span className="trip-detail__stop-name">{cityLabel}</span>
            <CountryFlag
              className="trip-detail__stop-flag"
              countryId={city.country.id}
            />
            {isLayover ? (
              <span className="trip-detail__layover-label">
                {t("tripDetail.layover") || "Transit"}
              </span>
            ) : null}
          </div>
          {!isLayover ? (
            <span className="trip-detail__stop-dates">
              {formatDateRangeShort({
                sDateInput: stop.sDate,
                eDateInput: stop.eDate,
                locale: lang,
                showYear,
              })}
            </span>
          ) : null}
        </div>

        {!isLayover && nights > 0 ? (
          <span className="trip-detail__stop-nights">
            <MoonIcon className="trip-detail__stop-nights-icon" />
            {nights}
          </span>
        ) : null}
      </div>
    </m.div>
  );
}
