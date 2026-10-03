import "./TripItinerary.scss";

import {
  City,
  mediaUrl,
  parseLocalDate,
  PublishedImage,
  Trip,
  TripLeg,
  TripOuting,
  TripStay,
} from "@travelmap/core";
import { CSSProperties, Fragment, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

import CalendarIcon from "@/assets/icons/Calendar.svg?react";
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
import { classNames } from "@/shared/lib/classNames";
import { formatDuration, formatMileage } from "@/shared/lib/format";
import { getPhotoTravelIndex } from "@/shared/lib/travelQueries";

import {
  blockKey,
  buildItinerary,
  ItineraryBlock,
  timeOf,
} from "../../lib/tripItinerary";

/**
 * Formats one calendar day with its weekday, such as `Fri 27 Mar`.
 * @param {string} date - A YYYY-MM-DD date
 * @param {string} locale - The active locale
 * @returns {string} The localized label
 */
function formatDay(date: string, locale: string): string {
  return formatDateRangeShort({
    includeWeekday: true,
    locale,
    sDateInput: parseLocalDate(date.slice(0, 10)),
    showYear: false,
  });
}

/**
 * Upper-cases a label's first letter, since some locales write weekday names in
 * lower case and a pill reads better starting with a capital.
 * @param {string} text - The label
 * @returns {string} The label with a capital first letter
 */
function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/**
 * Finds the gallery a visit's photos open in, or -1 when it has none.
 * @param {City} city - The place
 * @param {Date} arrivedAt - The visit's start, its gallery identity
 * @returns {number} The city's gallery index
 */
function galleryIndex(city: City, arrivedAt: Date): number {
  return getPhotoTravelIndex(city, arrivedAt, visitedTrips);
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
 * Properties accepted by the LegRow component.
 * @property {TripLeg} leg - The ride
 */
interface LegRowProps {
  leg: TripLeg;
}

/**
 * LegRow component
 * One ride: how, from where to where, when, how long and how far. Values that
 * were estimated rather than recorded say so, and a place with photos offers
 * them directly.
 * @component
 * @param {LegRowProps} props - The row props
 * @param {TripLeg} props.leg - The ride
 * @returns {ReactNode} The ride row
 */
function LegRow({ leg }: LegRowProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const openGallery = useOpenGallery();
  const { setHoveredCity } = useMapInteraction();
  const from = leg.from.getLocalizedName(lang);
  const to = leg.to.getLocalizedName(lang);
  const departs = timeOf(leg.depart);
  const arrives = timeOf(leg.arrive);
  const approx = `${t("tripDetail.approx")} `;
  const photos = leg.photos?.length ? galleryIndex(leg.to, leg.arrivedAt) : -1;
  const operator = leg.flight?.company ?? leg.ferryCompany;
  const details = [
    departs && departs === arrives
      ? departs
      : departs || arrives
        ? `${departs ?? "?"} → ${arrives ?? "?"}`
        : null,
    `${leg.duration.estimated ? approx : ""}${formatDuration(leg.duration.value)}`,
    `${leg.distance.estimated ? approx : ""}${formatMileage(leg.distance.value, lang, 0)} km`,
    [operator ? resolveCompany(operator).name : null, leg.flight?.number]
      .filter(Boolean)
      .join(" "),
  ].filter(Boolean);

  return (
    <li
      className={`trip-itinerary__leg trip-itinerary__leg--${leg.mode}`}
      onMouseEnter={() => setHoveredCity(leg.to)}
      onMouseLeave={() => setHoveredCity(null)}
    >
      <TransportModeIcon className="trip-itinerary__leg-icon" mode={leg.mode} />
      <div className="trip-itinerary__leg-body">
        <span className="trip-itinerary__leg-route">{`${from} → ${to}`}</span>
        <span className="trip-itinerary__leg-details">
          {details.join(" · ")}
          {leg.via.length > 0
            ? ` · ${t("tripDetail.via")} ${leg.via
                .map((city) => city.getLocalizedName(lang))
                .join(", ")}`
            : ""}
        </span>
      </div>
      {photos >= 0 ? (
        <button
          aria-label={t("tripDetail.openPhotos", { city: to })}
          className="trip-itinerary__photo"
          onClick={() => openGallery(leg.to, photos)}
          type="button"
        >
          <img
            alt=""
            className="trip-itinerary__photo-image"
            loading="lazy"
            src={firstPhoto(leg.photos)}
          />
        </button>
      ) : null}
    </li>
  );
}

/**
 * Properties accepted by the RideHop component.
 * @property {TripLeg} leg - The ride between two places of a day trip
 */
interface RideHopProps {
  leg: TripLeg;
}

/**
 * RideHop component
 * The thin link between two places of a day trip: how the traveller got from
 * one to the next and how long it took, kept quieter than the places so the
 * eye reads the places first and the rides second.
 * @component
 * @param {RideHopProps} props - The hop props
 * @param {TripLeg} props.leg - The ride
 * @returns {ReactNode} The ride connector
 */
function RideHop({ leg }: RideHopProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const approx = `${t("tripDetail.approx")} `;
  return (
    <li className={`trip-itinerary__hop trip-itinerary__hop--${leg.mode}`}>
      <TransportModeIcon className="trip-itinerary__hop-icon" mode={leg.mode} />
      <span className="trip-itinerary__hop-text">
        {t(`tripDetail.modeName.${leg.mode}`)} ·{" "}
        {leg.duration.estimated ? approx : ""}
        {formatDuration(leg.duration.value)} ·{" "}
        {leg.distance.estimated ? approx : ""}
        {formatMileage(leg.distance.value, lang, 0)} km
      </span>
    </li>
  );
}

/**
 * Properties accepted by the PlaceCard component.
 * @property {TripLeg} leg - The ride that arrived at the place
 */
interface PlaceCardProps {
  leg: TripLeg;
}

/**
 * PlaceCard component
 * One place seen on a day trip. With photos the whole card is the way into
 * its gallery, its own picture on the left; without, it is a plain label.
 * @component
 * @param {PlaceCardProps} props - The card props
 * @param {TripLeg} props.leg - The ride that arrived at the place
 * @returns {ReactNode} The place card
 */
function PlaceCard({ leg }: PlaceCardProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const openGallery = useOpenGallery();
  const { setHoveredCity } = useMapInteraction();
  const city = leg.to.getLocalizedName(lang);
  const photos = leg.photos?.length ? galleryIndex(leg.to, leg.arrivedAt) : -1;
  const arrived = timeOf(leg.arrive);
  const content = (
    <>
      {photos >= 0 ? (
        <img
          alt=""
          className="trip-itinerary__place-image"
          loading="lazy"
          src={firstPhoto(leg.photos)}
        />
      ) : (
        <span className="trip-itinerary__place-image trip-itinerary__place-image--empty">
          <PositionIcon aria-hidden="true" />
        </span>
      )}
      <span className="trip-itinerary__place-text">
        <span className="trip-itinerary__place-name">
          {city}
          <CountryFlag
            className="trip-itinerary__flag"
            countryId={leg.to.country.id}
          />
        </span>
        <span className="trip-itinerary__place-meta">
          {photos >= 0
            ? t("tripDetail.seePhotos")
            : arrived
              ? t("tripDetail.arrivedAt", { time: arrived })
              : t("tripDetail.visited")}
        </span>
      </span>
      {photos >= 0 ? (
        <ChevronRightIcon
          aria-hidden="true"
          className="trip-itinerary__place-chevron"
        />
      ) : null}
    </>
  );

  return (
    <li
      className="trip-itinerary__place-item"
      onMouseEnter={() => setHoveredCity(leg.to)}
      onMouseLeave={() => setHoveredCity(null)}
    >
      {photos >= 0 ? (
        <button
          aria-label={t("tripDetail.openPhotos", { city })}
          className="trip-itinerary__place trip-itinerary__place--clickable"
          onClick={() => openGallery(leg.to, photos)}
          type="button"
        >
          {content}
        </button>
      ) : (
        <div className="trip-itinerary__place">{content}</div>
      )}
    </li>
  );
}

/**
 * Properties accepted by the OutingView component.
 * @property {TripOuting} outing - The day trip
 * @property {City} base - The stay it leaves from and returns to
 */
interface OutingViewProps {
  outing: TripOuting;
  base: City;
}

/**
 * OutingView component
 * A day trip told as a route: a one-line summary of where it went, then each
 * place as a card with the ride that reached it in between, ending back at
 * the stay, so a loop through three towns reads in the order it happened.
 * @component
 * @param {OutingViewProps} props - The view props
 * @param {TripOuting} props.outing - The day trip
 * @param {City} props.base - The stay it leaves from and returns to
 * @returns {ReactNode} The day trip
 */
function OutingView({ outing, base }: OutingViewProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const km = outing.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
  const minutes = outing.legs.reduce((sum, leg) => sum + leg.duration.value, 0);
  const places = outing.legs.slice(0, -1);
  const last = outing.legs.at(-1);

  return (
    <div className="trip-itinerary__outing">
      <div className="trip-itinerary__outing-header">
        <span className="trip-itinerary__label">
          {t("tripDetail.dayTrip")} · {formatDay(outing.date, lang)}
        </span>
        <span className="trip-itinerary__outing-route">
          {[base, ...places.map((leg) => leg.to), base]
            .map((city) => city.getLocalizedName(lang))
            .join(" → ")}
        </span>
        <span className="trip-itinerary__outing-total">
          {formatMileage(km, lang, 0)} km · {formatDuration(minutes)}
        </span>
      </div>
      <ol className="trip-itinerary__outing-steps">
        {places.map((leg) => (
          <Fragment key={`${leg.from.id}-${leg.to.id}`}>
            <RideHop leg={leg} />
            <PlaceCard leg={leg} />
          </Fragment>
        ))}
        {last ? <RideHop leg={last} /> : null}
        <li className="trip-itinerary__outing-end">
          {t("tripDetail.backTo", { city: base.getLocalizedName(lang) })}
        </li>
      </ol>
    </div>
  );
}

/**
 * Properties accepted by the StayBlock component.
 * @property {TripStay} stay - Where the traveller slept
 */
interface StayBlockProps {
  stay: TripStay;
}

/**
 * StayBlock component
 * A place the traveller slept: the city over its photo, with its nights and
 * dates as pills, and the day trips taken from it underneath so "based in
 * Kyoto, went to Osaka for the day" reads as exactly that.
 * @component
 * @param {StayBlockProps} props - The block props
 * @param {TripStay} props.stay - Where the traveller slept
 * @returns {ReactNode} The stay block
 */
function StayBlock({ stay }: StayBlockProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const openGallery = useOpenGallery();
  const { setHoveredCity } = useMapInteraction();
  const city = stay.city.getLocalizedName(lang);
  const photos = stay.photos?.length
    ? galleryIndex(stay.city, parseLocalDate(stay.checkIn))
    : -1;
  const image =
    (photos >= 0 ? stay.city.getBackgroundImgSourceByIndex(photos) : "") ||
    firstPhoto(stay.photos);
  const header = (
    <>
      {image ? (
        <img
          alt=""
          className="trip-itinerary__stay-image"
          loading="lazy"
          src={image}
        />
      ) : null}
      <span className="trip-itinerary__stay-text">
        <span className="trip-itinerary__stay-title">
          {city}
          <CountryFlag
            className="trip-itinerary__flag"
            countryId={stay.city.country.id}
          />
        </span>
        <span className="trip-itinerary__pills">
          <span className="trip-itinerary__pill">
            <MoonIcon
              aria-hidden="true"
              className="trip-itinerary__pill-icon"
            />
            {stay.nights > 0
              ? t("tripDetail.nightsCount", { count: stay.nights })
              : t("tripDetail.noNight")}
          </span>
          <span className="trip-itinerary__pill">
            <CalendarIcon
              aria-hidden="true"
              className="trip-itinerary__pill-icon"
            />
            {capitalize(
              formatDateRangeShort({
                eDateInput:
                  stay.nights > 0 ? parseLocalDate(stay.checkOut) : undefined,
                includeWeekday: true,
                locale: lang,
                sDateInput: parseLocalDate(stay.checkIn),
                showYear: false,
              }),
            )}
          </span>
        </span>
      </span>
    </>
  );
  const stayClass = classNames(
    "trip-itinerary__stay",
    image && "trip-itinerary__stay--with-image",
    photos >= 0 && "trip-itinerary__stay--clickable",
  );

  return (
    <li
      className="trip-itinerary__block trip-itinerary__block--stay"
      style={{ "--stay-color": stay.city.country.borderColor } as CSSProperties}
    >
      <div className="trip-itinerary__stay-row">
        {photos >= 0 ? (
          <button
            aria-label={t("tripDetail.openPhotos", { city })}
            className={stayClass}
            onClick={() => openGallery(stay.city, photos)}
            onMouseEnter={() => setHoveredCity(stay.city)}
            onMouseLeave={() => setHoveredCity(null)}
            type="button"
          >
            {header}
          </button>
        ) : (
          <div
            className={stayClass}
            onMouseEnter={() => setHoveredCity(stay.city)}
            onMouseLeave={() => setHoveredCity(null)}
          >
            {header}
          </div>
        )}
      </div>
      {stay.outings.map((outing) => (
        <OutingView
          base={stay.city}
          key={`${outing.date}-${outing.legs.map((leg) => leg.to.id).join("-")}`}
          outing={outing}
        />
      ))}
    </li>
  );
}

/**
 * Properties accepted by the BlockView component.
 * @property {ItineraryBlock} block - The block to render
 */
interface BlockViewProps {
  block: ItineraryBlock;
}

/**
 * BlockView component
 * Renders one itinerary block: an endpoint, a journey, or a stay.
 * @component
 * @param {BlockViewProps} props - The block props
 * @param {ItineraryBlock} props.block - The block to render
 * @returns {ReactNode} The block
 */
function BlockView({ block }: BlockViewProps): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);

  switch (block.kind) {
    case "start":
    case "end":
      return (
        <li className="trip-itinerary__block trip-itinerary__block--endpoint">
          <span className="trip-itinerary__endpoint">
            {t(
              block.kind === "start"
                ? "tripDetail.startedIn"
                : "tripDetail.backIn",
              { city: block.city.getLocalizedName(lang) },
            )}
          </span>
          <span className="trip-itinerary__label">
            {formatDay(block.date, lang)}
          </span>
        </li>
      );
    case "stay":
      return <StayBlock stay={block.stay} />;
    case "move":
      return (
        <li className="trip-itinerary__block trip-itinerary__block--move">
          <span className="trip-itinerary__label">
            {t("tripDetail.travel")} · {formatDay(block.departDate, lang)}
            {block.nightOnBoard ? (
              <span className="trip-itinerary__overnight">
                {t("tripDetail.nightOnBoard", { night: block.nightOnBoard })}
              </span>
            ) : null}
          </span>
          <ol className="trip-itinerary__legs">
            {block.move.legs.map((leg) => (
              <LegRow key={`${leg.from.id}-${leg.to.id}`} leg={leg} />
            ))}
          </ol>
        </li>
      );
  }
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
 * The trip read top to bottom: where it started, every journey with its rides,
 * every place slept with its nights and day trips, and where it ended.
 * @component
 * @param {TripItineraryProps} props - The itinerary props
 * @param {Trip} props.trip - The trip to lay out
 * @returns {ReactNode} The itinerary
 */
export function TripItinerary({ trip }: TripItineraryProps): ReactNode {
  return (
    <ol className="trip-itinerary">
      {buildItinerary(trip).map((block) => (
        <BlockView block={block} key={blockKey(block)} />
      ))}
    </ol>
  );
}
