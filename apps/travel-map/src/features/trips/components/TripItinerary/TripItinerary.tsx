import "./TripItinerary.scss";

import {
  City,
  mediaUrl,
  parseLocalDate,
  PublishedImage,
  Trip,
  TripLeg,
} from "@travelmap/core";
import { CSSProperties, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

import ChevronRightIcon from "@/assets/icons/ChevronRight.svg?react";
import MoonIcon from "@/assets/icons/Moon.svg?react";
import PositionIcon from "@/assets/icons/Position.svg?react";
import { resolveCompany } from "@/data/companies";
import { visitedTrips } from "@/data/world";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { formatDuration, formatMileage } from "@/shared/lib/format";
import { getPhotoTravelIndex } from "@/shared/lib/travelQueries";

import {
  buildChapters,
  Chapter,
  chapterKey,
  ChapterRow,
  StayDay,
  timeOf,
} from "../../lib/tripItinerary";

/**
 * Upper-cases a label's first letter, since some locales write weekday names in
 * lower case.
 * @param {string} text - The label
 * @returns {string} The label with a capital first letter
 */
function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/**
 * Formats a day or a range of days with weekdays, such as `Fri 27 Mar` or
 * `Sat 28 – Sun 29 Mar`.
 * @param {string} from - The first YYYY-MM-DD date, any time part ignored
 * @param {string} to - The last YYYY-MM-DD date, any time part ignored
 * @param {string} locale - The active locale
 * @returns {string} The localized label
 */
function formatDays(from: string, to: string, locale: string): string {
  return capitalize(
    formatDateRangeShort({
      eDateInput:
        to.slice(0, 10) === from.slice(0, 10)
          ? undefined
          : parseLocalDate(to.slice(0, 10)),
      includeWeekday: true,
      locale,
      sDateInput: parseLocalDate(from.slice(0, 10)),
      showYear: false,
    }),
  );
}

/**
 * Picks the image that stands for a visit: its first photo's thumbnail.
 * @param {PublishedImage[]} [photos] - The visit's gallery
 * @returns {string | undefined} A browser-ready URL, when there is a photo
 */
function firstPhoto(photos?: PublishedImage[]): string | undefined {
  return photos?.[0] ? mediaUrl(photos[0].thumbnail) : undefined;
}

/**
 * Returns a navigator that opens a city's gallery and remembers where the
 * reader came from, so closing the gallery lands back on this trip.
 * @returns {(city: City, index: number) => void} Opens one gallery
 */
function useOpenGallery(): (city: City, index: number) => void {
  const navigate = useNavigate();
  const location = useLocation();
  return (city, index) =>
    void navigate(`/gallery/${city.name}/${index}`, {
      state: { fromPath: `${location.pathname}${location.search}` },
    });
}

/**
 * Lists what is worth knowing about a ride beyond its clock times: how long,
 * how far, and — where it identifies the ride — the operator and flight. A
 * `~` marks a value worked out rather than recorded.
 * @param {TripLeg} leg - The ride
 * @param {string} lang - The active locale
 * @returns {string[]} The facts, in reading order
 */
function rideFacts(leg: TripLeg, lang: string): string[] {
  const operator = leg.flight?.company ?? leg.ferryCompany;
  return [
    `${leg.duration.estimated ? "~" : ""}${formatDuration(leg.duration.value)}`,
    `${leg.distance.estimated ? "~" : ""}${formatMileage(leg.distance.value, lang, 0)} km`,
    [operator ? resolveCompany(operator).name : null, leg.flight?.number]
      .filter(Boolean)
      .join(" ") || null,
  ].filter((fact): fact is string => Boolean(fact));
}

/**
 * Properties accepted by the RideRow component.
 * @property {TripLeg} leg - The ride
 */
interface RideRowProps {
  leg: TripLeg;
}

/**
 * RideRow component
 * One ride: mode, from → to, the clock times on the right, and how long, how
 * far, and with whom underneath.
 * @component
 * @param {RideRowProps} props - The row props
 * @param {TripLeg} props.leg - The ride
 * @returns {ReactNode} The ride row
 */
function RideRow({ leg }: RideRowProps): ReactNode {
  const { currLanguage: lang } = useLanguage(["home"]);
  const departs = timeOf(leg.depart);
  const arrives = timeOf(leg.arrive);
  const times =
    departs && arrives && departs !== arrives
      ? `${departs}–${arrives}`
      : (departs ?? arrives);

  return (
    <li
      className={`trip-chapter__row trip-chapter__ride trip-chapter__ride--${leg.mode}`}
    >
      <TransportModeIcon className="trip-chapter__ride-icon" mode={leg.mode} />
      <span className="trip-chapter__row-body">
        <span className="trip-chapter__row-line">
          <span className="trip-chapter__ride-route">
            {leg.from.getLocalizedName(lang)} → {leg.to.getLocalizedName(lang)}
          </span>
          {times ? (
            <span className="trip-chapter__ride-time">{times}</span>
          ) : null}
        </span>
        <span className="trip-chapter__row-detail">
          {rideFacts(leg, lang).join(" · ")}
        </span>
      </span>
    </li>
  );
}

/**
 * Properties accepted by the PlaceRow component.
 * @property {City} city - The place
 * @property {PublishedImage[]} [photos] - Photos taken there on this visit
 * @property {Date} visitStart - The visit's start, its gallery identity
 * @property {string} [detail] - A short line about the visit
 */
interface PlaceRowProps {
  city: City;
  photos?: PublishedImage[];
  visitStart: Date;
  detail?: string;
}

/**
 * PlaceRow component
 * A place with its own picture. With photos, the whole row opens the gallery;
 * without, it still marks the place in the route.
 * @component
 * @param {PlaceRowProps} props - The row props
 * @param {City} props.city - The place
 * @param {PublishedImage[]} [props.photos] - Photos taken there on this visit
 * @param {Date} props.visitStart - The visit's start, its gallery identity
 * @param {string} [props.detail] - A short line about the visit
 * @returns {ReactNode} The place row
 */
function PlaceRow({
  city,
  photos,
  visitStart,
  detail,
}: PlaceRowProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const openGallery = useOpenGallery();
  const { setHoveredCity } = useMapInteraction();
  const name = city.getLocalizedName(lang);
  const gallery = photos?.length
    ? getPhotoTravelIndex(city, visitStart, visitedTrips)
    : -1;
  const image = firstPhoto(photos);
  const content = (
    <>
      {image ? (
        <img
          alt=""
          className="trip-chapter__place-image"
          loading="lazy"
          src={image}
        />
      ) : (
        <span className="trip-chapter__place-image trip-chapter__place-image--empty">
          <PositionIcon aria-hidden="true" />
        </span>
      )}
      <span className="trip-chapter__row-body">
        <span className="trip-chapter__place-name">
          {name}
          <CountryFlag
            className="trip-chapter__flag"
            countryId={city.country.id}
          />
        </span>
        {detail ? (
          <span className="trip-chapter__row-detail">{detail}</span>
        ) : null}
      </span>
      {gallery >= 0 ? (
        <ChevronRightIcon
          aria-hidden="true"
          className="trip-chapter__chevron"
        />
      ) : null}
    </>
  );

  return (
    <li
      className="trip-chapter__row"
      onMouseEnter={() => setHoveredCity(city)}
      onMouseLeave={() => setHoveredCity(null)}
    >
      {gallery >= 0 ? (
        <button
          aria-label={t("tripDetail.openPhotos", { city: name })}
          className="trip-chapter__place trip-chapter__place--clickable"
          onClick={() => openGallery(city, gallery)}
          type="button"
        >
          {content}
        </button>
      ) : (
        <div className="trip-chapter__place">{content}</div>
      )}
    </li>
  );
}

/**
 * Properties accepted by the Rows component.
 * @property {ChapterRow[]} rows - The rows to render
 * @property {boolean} isDayTrip - Whether the rows are a day trip, whose places need no caption
 */
interface RowsProps {
  rows: ChapterRow[];
  isDayTrip: boolean;
}

/**
 * Rows component
 * Renders a chain of rides, places, and nights in transit in order.
 * @component
 * @param {RowsProps} props - The rows props
 * @param {ChapterRow[]} props.rows - The rows to render
 * @param {boolean} props.isDayTrip - Whether the rows are a day trip, whose places need no caption
 * @returns {ReactNode} The list of rows
 */
function Rows({ rows, isDayTrip }: RowsProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  return (
    <ul className="trip-chapter__rows">
      {rows.map((row) => {
        switch (row.kind) {
          case "ride":
            return (
              <RideRow
                key={`ride-${row.leg.from.id}-${row.leg.to.id}`}
                leg={row.leg}
              />
            );
          case "place":
            return (
              <PlaceRow
                city={row.leg.to}
                detail={isDayTrip ? undefined : t("tripDetail.visitedOnTheWay")}
                key={`place-${row.leg.to.id}-${row.leg.from.id}`}
                photos={row.leg.photos}
                visitStart={row.leg.arrivedAt}
              />
            );
          case "transit":
            return (
              <li
                className="trip-chapter__row trip-chapter__transit"
                key={`night-${row.city.id}`}
              >
                <MoonIcon
                  aria-hidden="true"
                  className="trip-chapter__transit-icon"
                />
                {t("tripDetail.nightInTransitAt", {
                  city: row.city.getLocalizedName(lang),
                })}
              </li>
            );
        }
      })}
    </ul>
  );
}

/**
 * Properties accepted by the StayDays component.
 * @property {StayDay[]} days - The stay's days
 * @property {City} city - Where the stay was
 */
interface StayDaysProps {
  days: StayDay[];
  city: City;
}

/**
 * StayDays component
 * The days of a stay under their dates: day trips with every ride and place,
 * and the remaining days spent in the city folded into one line.
 * @component
 * @param {StayDaysProps} props - The days props
 * @param {StayDay[]} props.days - The stay's days
 * @param {City} props.city - Where the stay was
 * @returns {ReactNode} The days
 */
function StayDays({ days, city }: StayDaysProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  return days.map((day) =>
    day.kind === "outing" ? (
      <div
        className="trip-chapter__day"
        key={`outing-${day.date}-${day.rows.length}`}
      >
        <p className="trip-chapter__day-title">
          {formatDays(day.date, day.date, lang)} · {t("tripDetail.dayTrip")}
        </p>
        <Rows isDayTrip rows={day.rows} />
      </div>
    ) : (
      <p
        className="trip-chapter__day-title trip-chapter__day-title--free"
        key={`free-${day.from}`}
      >
        {formatDays(day.from, day.to, lang)} ·{" "}
        {t("tripDetail.inCity", { city: city.getLocalizedName(lang) })}
      </p>
    ),
  );
}

/**
 * Properties accepted by the ChapterView component.
 * @property {Chapter} chapter - The chapter
 * @property {number} number - Its position in the trip, from one
 */
interface ChapterViewProps {
  chapter: Chapter;
  number: number;
}

/**
 * ChapterView component
 * One numbered chapter: a heading that says what it is and when, then every
 * ride, place, and day in it — nothing folded away.
 * @component
 * @param {ChapterViewProps} props - The chapter props
 * @param {Chapter} props.chapter - The chapter
 * @param {number} props.number - Its position in the trip, from one
 * @returns {ReactNode} The chapter
 */
function ChapterView({ chapter, number }: ChapterViewProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const isStay = chapter.kind === "stay";
  const eyebrow = isStay
    ? t("tripDetail.nightsCount", { count: chapter.stay.nights })
    : t(`tripDetail.chapter.${chapter.role}`);
  const title = isStay
    ? chapter.stay.city.getLocalizedName(lang)
    : `${chapter.from.getLocalizedName(lang)} → ${chapter.to.getLocalizedName(lang)}`;
  const dates = isStay
    ? formatDays(chapter.stay.checkIn, chapter.stay.checkOut, lang)
    : formatDays(chapter.startDate, chapter.endDate, lang);

  return (
    <li
      className={`trip-chapter trip-chapter--${chapter.kind}`}
      style={
        isStay
          ? ({
              "--chapter-color": chapter.stay.city.country.borderColor,
            } as CSSProperties)
          : undefined
      }
    >
      <header className="trip-chapter__header">
        <span className="trip-chapter__number">{number}</span>
        <span className="trip-chapter__heading">
          <span className="trip-chapter__eyebrow">
            {eyebrow} · {dates}
          </span>
          <span className="trip-chapter__title">
            {title}
            {isStay ? (
              <CountryFlag
                className="trip-chapter__flag"
                countryId={chapter.stay.city.country.id}
              />
            ) : null}
          </span>
        </span>
      </header>
      <div className="trip-chapter__body">
        {isStay ? (
          <>
            {chapter.stay.photos?.length ? (
              <ul className="trip-chapter__rows">
                <PlaceRow
                  city={chapter.stay.city}
                  detail={t("tripDetail.photosOfStay")}
                  photos={chapter.stay.photos}
                  visitStart={parseLocalDate(chapter.stay.checkIn)}
                />
              </ul>
            ) : null}
            <StayDays city={chapter.stay.city} days={chapter.days} />
          </>
        ) : (
          <Rows isDayTrip={false} rows={chapter.rows} />
        )}
      </div>
    </li>
  );
}

/**
 * Properties accepted by the TripItinerary component.
 * @property {Trip} trip - The trip to lay out
 */
interface TripItineraryProps {
  trip: Trip;
}

/**
 * TripItinerary component
 * The trip as numbered chapters — getting there, each place slept in with its
 * days, moving on, going home — with every ride, place, and night shown in
 * order, so the whole route reads top to bottom without opening anything.
 * @component
 * @param {TripItineraryProps} props - The itinerary props
 * @param {Trip} props.trip - The trip to lay out
 * @returns {ReactNode} The itinerary
 */
export function TripItinerary({ trip }: TripItineraryProps): ReactNode {
  return (
    <ol className="trip-itinerary">
      {buildChapters(trip).map((chapter, index) => (
        <ChapterView
          chapter={chapter}
          key={chapterKey(chapter)}
          number={index + 1}
        />
      ))}
    </ol>
  );
}
