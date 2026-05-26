import "./TimelineDayTripRow.scss";

import { m } from "framer-motion";
import { CSSProperties, JSX, use } from "react";
import {
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router-dom";

import { CountryFlag } from "@/components/atoms";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { City, TripStop } from "@/core";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { classNames } from "@/utils/className";

interface TimelineDayTripRowProps {
  city: City;
  travelIdx: number;
  stop: TripStop;
  animDelay: number;
  showYear: boolean;
  isNested: boolean;
}

/**
 * TimelineDayTripRow component
 *
 * Renders a day-trip (zero-night stop) on the timeline as a compact card.
 * Shows the city thumbnail, name, flag, and visit date. Nested day-trips
 * (those with a base city above them) render with extra left indent. Clickable
 * when the stop has photos — navigates to the city gallery.
 *
 * @component
 *
 * @param {TimelineDayTripRowProps} props
 * @param {City} props.city - The day-trip city
 * @param {number} props.travelIdx - Index of this visit within the city
 * @param {TripStop} props.stop - Raw stop data with dates and photo list
 * @param {number} props.animDelay - Framer Motion entrance delay in seconds
 * @param {boolean} props.showYear - Whether date ranges include the year
 * @param {boolean} props.isNested - Whether a base stop precedes this day-trip (adds indent)
 * @returns {JSX.Element} The day-trip row
 */
export function TimelineDayTripRow({
  city,
  travelIdx,
  stop,
  animDelay,
  showYear,
  isNested,
}: TimelineDayTripRowProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { setHoveredCity } = use(HomeContext)!;

  const hasPhotos = Boolean(stop.photos && stop.photos.length > 0);
  const isClickable = hasPhotos;
  const galleryTravelIdx = travelIdx;
  const thumbSrc = city.getBackgroundImgSourceByIndex(travelIdx);
  const cityLabel = t(`cities.${city.name}`) || city.name;

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
        <div className="trip-detail__dot trip-detail__dot--day-trip" />
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
        <div className="trip-detail__day-trip-info">
          <span className="trip-detail__day-trip-name">{cityLabel}</span>
          <CountryFlag
            className="trip-detail__day-trip-flag"
            countryId={city.country.id}
          />
        </div>
        {stop ? (
          <span className="trip-detail__day-trip-date">
            {formatDateRangeShort({
              sDateInput: stop.sDate,
              eDateInput: stop.eDate,
              locale: lang,
              showYear,
            })}
          </span>
        ) : null}
      </div>
    </m.div>
  );
}
