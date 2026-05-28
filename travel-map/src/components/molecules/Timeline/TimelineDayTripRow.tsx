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
  parentCity: City | null;
}

/**
 * TimelineDayTripRow component
 *
 * Renders a day-trip (zero-night stop) on the timeline.
 *
 * Two visual variants:
 * - **Nested** (`isNested=true`): excursion from a base stop city — styled like a
 *   smaller stop card, flush with the track, no extra indent.
 * - **Non-nested** (`isNested=false`): standalone waypoint — more compact,
 *   slightly indented, lighter treatment.
 *
 * @component
 */
export function TimelineDayTripRow({
  city,
  travelIdx,
  stop,
  animDelay,
  showYear,
  isNested,
  parentCity,
}: TimelineDayTripRowProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { setHoveredCity } = use(HomeContext)!;

  const hasPhotos = Boolean(stop.photos && stop.photos.length > 0);
  const thumbSrc = city.getBackgroundImgSourceByIndex(travelIdx);
  const cityLabel = t(`cities.${city.name}`) || city.name;
  const parentLabel = parentCity
    ? t(`cities.${parentCity.name}`) || parentCity.name
    : null;

  const handleClick = hasPhotos
    ? () =>
        navigate(`/gallery/${city.name}/${travelIdx}`, {
          state: {
            fromPath: `${routerLocation.pathname}${routerLocation.search}`,
          },
        })
    : undefined;

  if (isNested) {
    return (
      <m.div
        animate={{ opacity: 1, x: 0 }}
        className="trip-detail__row trip-detail__row--day-trip trip-detail__row--day-trip-nested"
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
            "trip-detail__day-trip-card trip-detail__day-trip-card--nested-stop",
            hasPhotos && "trip-detail__day-trip-card--clickable",
          )}
          onClick={handleClick}
          onMouseEnter={() => setHoveredCity(city)}
          onMouseLeave={() => setHoveredCity(null)}
          {...(hasPhotos ? { role: "button" as const, tabIndex: 0 } : {})}
        >
          <div className="trip-detail__day-trip-thumb trip-detail__day-trip-thumb--md">
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
            <div className="trip-detail__day-trip-top">
              <span className="trip-detail__day-trip-name trip-detail__day-trip-name--md">
                {cityLabel}
              </span>
              <CountryFlag
                className="trip-detail__day-trip-flag"
                countryId={city.country.id}
              />
            </div>
            {stop ? (
              <span className="trip-detail__day-trip-dates">
                {formatDateRangeShort({
                  sDateInput: stop.sDate,
                  eDateInput: stop.eDate,
                  locale: lang,
                  showYear,
                })}
              </span>
            ) : null}
          </div>
        </div>
      </m.div>
    );
  }

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
          hasPhotos && "trip-detail__day-trip-card--clickable",
          parentLabel && "trip-detail__day-trip-card--has-parent",
        )}
        onClick={handleClick}
        onMouseEnter={() => setHoveredCity(city)}
        onMouseLeave={() => setHoveredCity(null)}
        {...(hasPhotos ? { role: "button" as const, tabIndex: 0 } : {})}
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
          <div className="trip-detail__day-trip-top">
            <span className="trip-detail__day-trip-name">{cityLabel}</span>
            <CountryFlag
              className="trip-detail__day-trip-flag"
              countryId={city.country.id}
            />
          </div>
          {stop ? (
            <span className="trip-detail__day-trip-dates">
              {formatDateRangeShort({
                sDateInput: stop.sDate,
                eDateInput: stop.eDate,
                locale: lang,
                showYear,
              })}
            </span>
          ) : null}
        </div>
      </div>
    </m.div>
  );
}
