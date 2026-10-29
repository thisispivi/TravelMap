import "./TripItinerary.scss";

import { City, parseLocalDate, Trip, TripLeg, TripStay } from "@travelmap/core";
import { m } from "framer-motion";
import { BedDouble, Flag, Moon } from "lucide-react";
import { CSSProperties, ReactNode } from "react";

import { resolveCompany } from "@/data/companies";
import { formatDateRangeShort } from "@/i18n/functions/date";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { CoverImage } from "@/shared/components/CoverImage/CoverImage";
import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { formatDuration, formatMileage } from "@/shared/lib/format";
import { MODE_COLORS } from "@/shared/lib/modeColors";
import { staggerItem, staggerList } from "@/shared/lib/motion";

import {
  buildItinerary,
  Connection,
  daysLater,
  ItineraryLeg,
  Outing,
  timeOf,
} from "../../lib/tripItinerary";

/**
 * Formats one day, or a range of days, with short weekdays: `Fri 27 Mar` or
 * `Sat 28 – Sun 29 Mar`. Some locales write weekdays in lower case, so the
 * first letter is raised.
 * @param {string} from - The first YYYY-MM-DD date
 * @param {string} to - The last YYYY-MM-DD date
 * @param {string} locale - The active locale
 * @returns {string} The label
 */
function formatDays(from: string, to: string, locale: string): string {
  const label = formatDateRangeShort({
    eDateInput: from === to ? undefined : parseLocalDate(to),
    includeWeekday: true,
    locale,
    sDateInput: parseLocalDate(from),
    showYear: false,
  });
  return label.charAt(0).toLocaleUpperCase() + label.slice(1);
}

/**
 * Callbacks that point the map at a place from the itinerary.
 * @property {(city: City | null) => void} onHoverCity - Highlights a place on the map
 * @property {(city: City) => void} onFocusCity - Flies the map to a place
 */
interface CityFocusProps {
  onHoverCity: (city: City | null) => void;
  onFocusCity: (city: City) => void;
}

/**
 * Properties accepted by the LegCard component.
 * @property {TripLeg} leg - The ride
 */
interface LegCardProps {
  leg: TripLeg;
}

/**
 * LegStub component
 * The tear-off part of a ride's pass: the mode in its colour, and the
 * operator's logo, name and flight number when they are recorded.
 * @component
 * @param {LegCardProps} props - The stub props
 * @param {TripLeg} props.leg - The ride
 * @returns {ReactNode} The stub
 */
function LegStub({ leg }: LegCardProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const operatorId = leg.flight?.company ?? leg.ferryCompany;
  const operator = operatorId ? resolveCompany(operatorId) : undefined;
  const number = leg.flight?.number;

  return (
    <div className="leg-card__stub">
      <span className="leg-card__mode-name">
        <TransportModeIcon className="leg-card__mode-icon" mode={leg.mode} />
        {t(`mode.${leg.mode}`)}
      </span>
      {operator || number ? (
        <span className="leg-card__operator">
          {operator?.logo ? (
            <img
              alt=""
              aria-hidden="true"
              className="leg-card__logo"
              src={operator.logo}
            />
          ) : null}
          <span className="leg-card__operator-name">
            {[operator?.name, number].filter(Boolean).join(" · ")}
          </span>
        </span>
      ) : null}
    </div>
  );
}

/**
 * LegCard component
 * One ride drawn as a two-part pass. The upper part holds the two cities,
 * their clocks under them when they are known with `+1` when the ride lands a
 * day later, and how long and how far between them; `LegStub` sits below the
 * tear. A `~` marks a value worked out rather than recorded.
 * @component
 * @param {LegCardProps} props - The card props
 * @param {TripLeg} props.leg - The ride
 * @returns {ReactNode} The leg card
 */
function LegCard({ leg }: LegCardProps): ReactNode {
  const { currLanguage } = useLanguage(["home"]);
  const departAt = timeOf(leg.depart);
  const arriveAt = timeOf(leg.arrive);
  const dayShift = daysLater(leg.depart ?? leg.date, leg.arrive);

  return (
    <div
      className="leg-card"
      style={{ "--mode-color": MODE_COLORS[leg.mode] } as CSSProperties}
    >
      <div
        className={classNames(
          "leg-card__main",
          (departAt || arriveAt) && "leg-card__main--timed",
        )}
      >
        <span className="leg-card__city">
          {leg.from.getLocalizedName(currLanguage)}
        </span>
        <span className="leg-card__facts">
          <span className="leg-card__duration">
            {leg.duration.estimated ? "~" : ""}
            {formatDuration(leg.duration.value)}
          </span>
          <span aria-hidden="true" className="leg-card__line" />
          <span className="leg-card__distance">
            {leg.distance.estimated ? "~" : ""}
            {formatMileage(leg.distance.value, currLanguage, 0)} km
          </span>
        </span>
        <span className="leg-card__city leg-card__city--end">
          {leg.to.getLocalizedName(currLanguage)}
        </span>
        {departAt || arriveAt ? (
          <>
            <span className="leg-card__time">{departAt}</span>
            <span className="leg-card__time leg-card__time--end">
              {arriveAt}
              {arriveAt && dayShift > 0 ? (
                <sup className="leg-card__day-shift">+{dayShift}</sup>
              ) : null}
            </span>
          </>
        ) : null}
      </div>
      <LegStub leg={leg} />
    </div>
  );
}

/**
 * Properties accepted by the PlaceRow component.
 * @property {City} city - The place
 * @property {string} label - What the visit was, such as "Day trip"
 */
interface PlaceRowProps extends CityFocusProps {
  city: City;
  label: string;
}

/**
 * PlaceRow component
 * A place that was seen, with its picture: pressing it shows it on the map.
 * @component
 * @param {PlaceRowProps} props - The row props
 * @param {City} props.city - The place
 * @param {string} props.label - What the visit was
 * @param {(city: City | null) => void} props.onHoverCity - Highlights a place on the map
 * @param {(city: City) => void} props.onFocusCity - Flies the map to a place
 * @returns {ReactNode} The place row
 */
function PlaceRow({
  city,
  label,
  onHoverCity,
  onFocusCity,
}: PlaceRowProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const name = city.getLocalizedName(currLanguage);

  return (
    <button
      aria-label={t("itinerary.showOnMap", { city: name })}
      className="place-row"
      onClick={() => onFocusCity(city)}
      onMouseEnter={() => onHoverCity(city)}
      onMouseLeave={() => onHoverCity(null)}
      type="button"
    >
      <CoverImage
        className="place-row__image"
        src={city.getBackgroundImgSourceByIndex(0)}
      />
      <span className="place-row__body">
        <span className="place-row__name">
          {name}
          <CountryFlag
            className="place-row__flag"
            countryId={city.country.id}
          />
        </span>
        <span className="place-row__label">{label}</span>
      </span>
    </button>
  );
}

/**
 * Properties accepted by the ConnectionRow component.
 * @property {Connection} connection - What happened between two rides
 */
interface ConnectionRowProps extends CityFocusProps {
  connection: Connection;
}

/**
 * ConnectionRow component
 * The pause between two rides: a place seen on the way gets its own row with
 * its picture; a change of plane or train is a quiet line with how long it
 * took, and a night spent waiting is marked with a moon.
 * @component
 * @param {ConnectionRowProps} props - The row props
 * @param {Connection} props.connection - What happened between two rides
 * @param {(city: City | null) => void} props.onHoverCity - Highlights a place on the map
 * @param {(city: City) => void} props.onFocusCity - Flies the map to a place
 * @returns {ReactNode} The connection row
 */
function ConnectionRow({
  connection,
  onHoverCity,
  onFocusCity,
}: ConnectionRowProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const { city, isOvernight, isVisited, minutes } = connection;
  const name = city.getLocalizedName(currLanguage);

  if (isVisited)
    return (
      <PlaceRow
        city={city}
        label={t("itinerary.visitedOnTheWay")}
        onFocusCity={onFocusCity}
        onHoverCity={onHoverCity}
      />
    );

  return (
    <p className="itinerary__connection">
      {isOvernight ? (
        <Moon aria-hidden="true" className="itinerary__connection-icon" />
      ) : null}
      {isOvernight
        ? t("itinerary.nightAt", { city: name })
        : minutes !== undefined
          ? t("itinerary.layoverIn", {
              city: name,
              time: formatDuration(minutes),
            })
          : t("itinerary.changeIn", { city: name })}
    </p>
  );
}

/**
 * Properties accepted by the MoveBlock component.
 * @property {ItineraryLeg[]} legs - The rides, each with what followed it
 */
interface MoveBlockProps extends CityFocusProps {
  legs: ItineraryLeg[];
}

/**
 * MoveBlock component
 * Getting from one bed to the next: a pass per ride with the connections in
 * between.
 * @component
 * @param {MoveBlockProps} props - The block props
 * @param {ItineraryLeg[]} props.legs - The rides, each with what followed it
 * @param {(city: City | null) => void} props.onHoverCity - Highlights a place on the map
 * @param {(city: City) => void} props.onFocusCity - Flies the map to a place
 * @returns {ReactNode} The move
 */
function MoveBlock({
  legs,
  onHoverCity,
  onFocusCity,
}: MoveBlockProps): ReactNode {
  return (
    <div className="itinerary__move">
      {legs.map(({ leg, connection }) => (
        <div
          className="itinerary__leg"
          key={`${leg.from.id}-${leg.to.id}-${leg.date}`}
        >
          <LegCard leg={leg} />
          {connection ? (
            <ConnectionRow
              connection={connection}
              onFocusCity={onFocusCity}
              onHoverCity={onHoverCity}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

/**
 * Properties accepted by the OutingRow component.
 * @property {Outing} outing - The day trip
 */
interface OutingRowProps extends CityFocusProps {
  outing: Outing;
}

/**
 * OutingRow component
 * One day trip from a stay: its date, how the traveller went, and each place
 * seen.
 * @component
 * @param {OutingRowProps} props - The row props
 * @param {Outing} props.outing - The day trip
 * @param {(city: City | null) => void} props.onHoverCity - Highlights a place on the map
 * @param {(city: City) => void} props.onFocusCity - Flies the map to a place
 * @returns {ReactNode} The outing
 */
function OutingRow({
  outing,
  onHoverCity,
  onFocusCity,
}: OutingRowProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const modes = [...new Set(outing.legs.map((leg) => leg.mode))];

  return (
    <li className="stay-card__outing">
      <p className="stay-card__outing-date">
        {formatDays(outing.date, outing.date, currLanguage)}
        <span className="stay-card__outing-modes">
          {modes.map((mode) => (
            <TransportModeIcon
              className="stay-card__outing-mode"
              key={mode}
              mode={mode}
            />
          ))}
        </span>
      </p>
      {outing.places.map((city) => (
        <PlaceRow
          city={city}
          key={city.id}
          label={t("itinerary.dayTrip")}
          onFocusCity={onFocusCity}
          onHoverCity={onHoverCity}
        />
      ))}
    </li>
  );
}

/**
 * Properties accepted by the StayCard component.
 * @property {TripStay} stay - Where the traveller slept
 * @property {Outing[]} outings - The day trips taken from there
 */
interface StayCardProps extends CityFocusProps {
  stay: TripStay;
  outings: Outing[];
}

/**
 * StayCard component
 * A place slept in, drawn as a pass: the city's picture, check-in, check-out
 * and nights, then the day trips taken from it.
 * @component
 * @param {StayCardProps} props - The card props
 * @param {TripStay} props.stay - Where the traveller slept
 * @param {Outing[]} props.outings - The day trips taken from there
 * @param {(city: City | null) => void} props.onHoverCity - Highlights a place on the map
 * @param {(city: City) => void} props.onFocusCity - Flies the map to a place
 * @returns {ReactNode} The stay card
 */
function StayCard({
  stay,
  outings,
  onHoverCity,
  onFocusCity,
}: StayCardProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const name = stay.city.getLocalizedName(currLanguage);

  return (
    <div
      className={classNames(
        "stay-card",
        outings.length > 0 && "stay-card--split",
      )}
    >
      <div className="stay-card__pass">
        <button
          aria-label={t("itinerary.showOnMap", { city: name })}
          className="stay-card__banner"
          onClick={() => onFocusCity(stay.city)}
          onMouseEnter={() => onHoverCity(stay.city)}
          onMouseLeave={() => onHoverCity(null)}
          type="button"
        >
          <CoverImage
            className="stay-card__image"
            src={stay.city.getBackgroundImgSourceByIndex(0)}
          />
          <span className="stay-card__title">
            <span className="stay-card__name">{name}</span>
            <CountryFlag
              className="stay-card__flag"
              countryId={stay.city.country.id}
            />
          </span>
        </button>
        <dl className="stay-card__facts">
          <div className="stay-card__fact">
            <dt className="stay-card__label">{t("itinerary.checkIn")}</dt>
            <dd className="stay-card__value">
              {formatDays(stay.checkIn, stay.checkIn, currLanguage)}
            </dd>
          </div>
          <div className="stay-card__fact">
            <dt className="stay-card__label">{t("itinerary.checkOut")}</dt>
            <dd className="stay-card__value">
              {formatDays(stay.checkOut, stay.checkOut, currLanguage)}
            </dd>
          </div>
          <div className="stay-card__fact stay-card__fact--nights">
            <dt className="stay-card__label">{t("itinerary.nightsLabel")}</dt>
            <dd className="stay-card__value stay-card__value--nights">
              {stay.nights}
            </dd>
          </div>
        </dl>
      </div>
      {outings.length > 0 ? (
        <ul className="stay-card__outings">
          {outings.map((outing) => (
            <OutingRow
              key={outing.date}
              onFocusCity={onFocusCity}
              onHoverCity={onHoverCity}
              outing={outing}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Properties accepted by the TripItinerary component.
 * @property {Trip} trip - The trip to lay out
 */
interface TripItineraryProps extends CityFocusProps {
  trip: Trip;
}

/**
 * TripItinerary component
 * The trip as one spine read top to bottom: where it started, every move as
 * a run of passes, every place slept in with its nights and day trips, and
 * where it ended. The node on the spine says which is which.
 * @component
 * @param {TripItineraryProps} props - The itinerary props
 * @param {Trip} props.trip - The trip to lay out
 * @param {(city: City | null) => void} props.onHoverCity - Highlights a place on the map
 * @param {(city: City) => void} props.onFocusCity - Flies the map to a place
 * @returns {ReactNode} The itinerary
 */
export function TripItinerary({
  trip,
  onHoverCity,
  onFocusCity,
}: TripItineraryProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);

  return (
    <m.ol
      animate="visible"
      className="itinerary"
      initial="hidden"
      variants={staggerList}
    >
      {buildItinerary(trip).map((item) => {
        switch (item.kind) {
          case "endpoint":
            return (
              <m.li
                className="itinerary__item itinerary__item--endpoint"
                key={`${item.role}-${item.city.id}`}
                variants={staggerItem}
              >
                <span aria-hidden="true" className="itinerary__node">
                  <Flag className="itinerary__node-icon" />
                </span>
                <p className="itinerary__endpoint">
                  <span className="itinerary__endpoint-city">
                    {item.city.getLocalizedName(currLanguage)}
                  </span>
                  <span className="itinerary__endpoint-date">
                    {t(`itinerary.${item.role}`)} ·{" "}
                    {formatDays(item.date, item.date, currLanguage)}
                  </span>
                </p>
              </m.li>
            );
          case "move":
            return (
              <m.li
                className="itinerary__item itinerary__item--move"
                key={item.key}
                variants={staggerItem}
              >
                <MoveBlock
                  legs={item.legs}
                  onFocusCity={onFocusCity}
                  onHoverCity={onHoverCity}
                />
              </m.li>
            );
          case "stay":
            return (
              <m.li
                className="itinerary__item itinerary__item--stay"
                key={item.key}
                variants={staggerItem}
              >
                <span aria-hidden="true" className="itinerary__node">
                  <BedDouble className="itinerary__node-icon" />
                </span>
                <StayCard
                  onFocusCity={onFocusCity}
                  onHoverCity={onHoverCity}
                  outings={item.outings}
                  stay={item.stay}
                />
              </m.li>
            );
        }
      })}
    </m.ol>
  );
}
