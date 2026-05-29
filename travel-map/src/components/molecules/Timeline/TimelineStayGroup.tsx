import "./TimelineStayGroup.scss";

import { m } from "framer-motion";
import { CSSProperties, JSX, use } from "react";
import {
  useLocation as useRouterLocation,
  useNavigate,
} from "react-router-dom";

import { CountryFlag, TransportModeIcon } from "@/components/atoms";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { City, TransportMode, TripStop } from "@/core";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { classNames } from "@/utils/className";
import { formatMileage } from "@/utils/format";
import { formatTripDetailDuration } from "@/utils/tripDetailTimeline";
import { getPhotoTravelIndex } from "@/utils/trips";

/** A single excursion (nested day trip) to be rendered under a stay group. */
export interface ExcursionItem {
  city: City;
  travelIdx: number;
  stop: TripStop;
  key: string;
  inboundTransport?: {
    mode: TransportMode;
    distanceKm: number;
    durationMinutes: number;
    fromCity: City;
    isRoundTrip?: boolean;
  };
  returnTransport?: {
    mode: TransportMode;
    distanceKm: number;
    durationMinutes: number;
    toCity: City;
  };
  chainBreakBefore: boolean;
}

interface TimelineStayGroupProps {
  city: City;
  travelIdx: number;
  stop: TripStop;
  nights: number;
  excursions: ExcursionItem[];
  animDelay: number;
  showYear: boolean;
}

/** Consecutive excursions grouped into movement chains. */
interface ExcursionChain {
  stops: ExcursionItem[];
  returnTransport?: ExcursionItem["returnTransport"];
}

/** Groups flat excursions into sequential chains using chainBreakBefore flags. */
function groupIntoChains(excursions: ExcursionItem[]): ExcursionChain[] {
  const chains: ExcursionChain[] = [];
  for (const exc of excursions) {
    if (exc.chainBreakBefore || chains.length === 0) {
      chains.push({ stops: [exc] });
    } else {
      chains[chains.length - 1].stops.push(exc);
    }
  }
  for (const chain of chains) {
    if (chain.stops.length > 1) {
      chain.returnTransport =
        chain.stops[chain.stops.length - 1].returnTransport;
    }
  }
  return chains;
}

/**
 * TimelineStayGroup component
 *
 * Renders a base-city stay card together with its nested excursion rows.
 * Excursions are connected to the stay via a vertical branch line drawn
 * entirely in CSS.
 *
 * @component
 *
 * @param {TimelineStayGroupProps} props - The stay group props
 * @param {City} props.city - The base city of the stay
 * @param {number} props.travelIdx - Visit index for the background image
 * @param {TripStop} props.stop - Stop metadata (dates, photos)
 * @param {number} props.nights - Number of nights at the base city
 * @param {ExcursionItem[]} props.excursions - Nested day-trip excursions
 * @param {number} props.animDelay - Staggered animation delay in seconds
 * @param {boolean} props.showYear - Whether to include the year in date labels
 * @returns {JSX.Element} The stay group with excursion branch
 */
export function TimelineStayGroup({
  city,
  travelIdx,
  stop,
  nights,
  excursions,
  animDelay,
  showYear,
}: TimelineStayGroupProps): JSX.Element {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { setHoveredCity } = use(HomeContext)!;

  const renderExcursionStop = (exc: ExcursionItem) => {
    const excLabel = t(`cities.${exc.city.name}`) || exc.city.name;
    const excGalleryIdx = getPhotoTravelIndex(
      exc.city,
      exc.stop.sDate,
      visitedTrips,
    );
    const excHasPhotos = excGalleryIdx >= 0;
    const excThumbSrc = exc.city.getBackgroundImgSourceByIndex(
      excHasPhotos ? excGalleryIdx : exc.travelIdx,
    );
    const excDate = formatDateRangeShort({
      sDateInput: exc.stop.sDate,
      eDateInput: exc.stop.eDate,
      locale: lang,
      showYear: false,
    });
    const tp = exc.inboundTransport ?? null;

    return (
      <div className="stay-group__excursion" key={exc.key}>
        {tp ? (
          <div className="stay-group__exc-transport-header">
            <TransportModeIcon
              className="stay-group__exc-transport-icon"
              mode={tp.mode}
            />
            {tp.isRoundTrip ? (
              <span className="stay-group__exc-transport-roundtrip">↔</span>
            ) : null}
            {tp.distanceKm > 0 ? (
              <span>{formatMileage(tp.distanceKm, lang)} km</span>
            ) : null}
            {tp.durationMinutes > 0 ? (
              <span>~{formatTripDetailDuration(tp.durationMinutes)}</span>
            ) : null}
          </div>
        ) : null}
        <div
          className={classNames(
            "stay-group__exc-card",
            excHasPhotos && "stay-group__exc-card--clickable",
          )}
          onClick={
            excHasPhotos
              ? () =>
                  navigate(`/gallery/${exc.city.name}/${excGalleryIdx}`, {
                    state: {
                      fromPath: `${routerLocation.pathname}${routerLocation.search}`,
                    },
                  })
              : undefined
          }
          onMouseEnter={() => setHoveredCity(exc.city)}
          onMouseLeave={() => setHoveredCity(null)}
          {...(excHasPhotos ? { role: "button" as const, tabIndex: 0 } : {})}
        >
          <div className="stay-group__exc-thumb">
            {excThumbSrc ? (
              <img
                alt={excLabel}
                className="stay-group__exc-thumb-img"
                src={excThumbSrc}
              />
            ) : (
              <div className="stay-group__exc-thumb-empty" />
            )}
          </div>
          <div className="stay-group__exc-body">
            <div className="stay-group__exc-header">
              <span className="stay-group__exc-name">{excLabel}</span>
              <CountryFlag
                className="stay-group__exc-flag"
                countryId={exc.city.country.id}
              />
            </div>
            <span className="stay-group__exc-meta">
              <span className="stay-group__exc-date">{excDate}</span>
            </span>
          </div>
          <div className="stay-group__exc-badge">
            {t("tripDetail.dayTrip") || "Day trip"}
          </div>
        </div>
      </div>
    );
  };

  const galleryTravelIdx = getPhotoTravelIndex(city, stop.sDate, visitedTrips);
  const hasPhotos = galleryTravelIdx >= 0;
  const thumbSrc = city.getBackgroundImgSourceByIndex(
    hasPhotos ? galleryTravelIdx : travelIdx,
  );
  const cityLabel = t(`cities.${city.name}`) || city.name;
  const dateRange = formatDateRangeShort({
    sDateInput: stop.sDate,
    eDateInput: stop.eDate,
    locale: lang,
    showYear,
  });
  const nightsLabel =
    nights === 1 ? t("tripDetail.night") : t("tripDetail.nights");

  return (
    <m.div
      animate={{ opacity: 1, x: 0 }}
      className="trip-detail__row trip-detail__row--stay-group"
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
        <div className="trip-detail__stay-dot" />
      </div>

      <div className="stay-group__content">
        <div
          className={classNames(
            "trip-detail__stay-card",
            hasPhotos && "trip-detail__stay-card--clickable",
          )}
          onClick={
            hasPhotos
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
          {...(hasPhotos ? { role: "button" as const, tabIndex: 0 } : {})}
        >
          <div className="trip-detail__stay-thumb">
            {thumbSrc ? (
              <img
                alt={cityLabel}
                className="trip-detail__stay-thumb-img"
                src={thumbSrc}
              />
            ) : (
              <div className="trip-detail__stay-thumb-empty" />
            )}
          </div>
          <div className="trip-detail__stay-body">
            <div className="trip-detail__stay-header">
              <span className="trip-detail__stay-name">{cityLabel}</span>
              <CountryFlag
                className="trip-detail__stay-flag"
                countryId={city.country.id}
              />
            </div>
            <span className="trip-detail__stay-meta">
              <span className="trip-detail__stay-date">{dateRange}</span>
            </span>
          </div>

          {nights > 0 ? (
            <div className="trip-detail__stay-nights-pill">
              {nights} {nightsLabel}
            </div>
          ) : null}
        </div>

        {excursions.length > 0 ? (
          <div className="stay-group__excursions">
            {groupIntoChains(excursions).map((chain) => {
              if (chain.stops.length > 1) {
                const rt = chain.returnTransport;
                return (
                  <div className="stay-group__chain" key={chain.stops[0].key}>
                    {chain.stops.map((exc) => renderExcursionStop(exc))}
                    {rt ? (
                      <div className="stay-group__chain-return">
                        <TransportModeIcon
                          className="stay-group__exc-transport-icon"
                          mode={rt.mode}
                        />
                        {rt.distanceKm > 0 ? (
                          <span>{formatMileage(rt.distanceKm, lang)} km</span>
                        ) : null}
                        {rt.durationMinutes > 0 ? (
                          <span>
                            ~{formatTripDetailDuration(rt.durationMinutes)}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              }
              return renderExcursionStop(chain.stops[0]);
            })}
          </div>
        ) : null}
      </div>
    </m.div>
  );
}
