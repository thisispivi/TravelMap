import "./TripList.scss";

import { Trip } from "@travelmap/core";
import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { CoverImage } from "@travelmap/ui/components/CoverImage/CoverImage";
import { EmptyState } from "@travelmap/ui/components/EmptyState/EmptyState";
import { PanelFrame } from "@travelmap/ui/components/PanelFrame/PanelFrame";
import { PanelHeader } from "@travelmap/ui/components/PanelHeader/PanelHeader";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { formatDateRangeShort } from "@travelmap/ui/i18n/date";
import { easeOut, staggerItem } from "@travelmap/ui/lib/motion";
import { AnimatePresence, m, Variants } from "framer-motion";
import { ReactNode, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { YearPills } from "@/shared/components/YearPills/YearPills";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";

import { browsableTrips, groupByYear } from "../../lib/trips";
import { bucketOf, bucketYears, fitSlots } from "../../lib/yearBuckets";

/** The trip list's years, newest first; the record never changes while open. */
const TRIP_YEARS = groupByYear(browsableTrips);

/** Pills shown before the row has been measured. */
const DEFAULT_SLOTS = 5;

/**
 * A year's cards slide in from the side its pill sits on and out the other
 * way; `direction` is 1 for an older year (to the right) and -1 for a newer.
 */
const slideList: Variants = {
  exit: (direction: number) => ({
    opacity: 0,
    transition: easeOut,
    x: direction * -24,
  }),
  hidden: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  visible: {
    opacity: 1,
    transition: { ...easeOut, staggerChildren: 0.03 },
    x: 0,
  },
};

/**
 * Properties accepted by the TripCard component.
 * @property {Trip} trip - The trip
 * @property {(trip: Trip) => void} onOpen - Opens the trip
 */
interface TripCardProps {
  trip: Trip;
  onOpen: (trip: Trip) => void;
}

/**
 * TripCard component
 * One trip in the list: its cover filling the card, with the title, dates and
 * nights printed over it and the flags of the countries it reached in a corner.
 * @component
 * @param {TripCardProps} props - The card props
 * @param {Trip} props.trip - The trip
 * @param {(trip: Trip) => void} props.onOpen - Opens the trip
 * @returns {ReactNode} The trip card
 */
function TripCard({ trip, onOpen }: TripCardProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const nights = trip.getNights();

  return (
    <m.li className="trip-list__item" variants={staggerItem}>
      <button
        className="trip-list__card"
        onClick={() => onOpen(trip)}
        type="button"
      >
        <CoverImage
          className="trip-list__cover"
          src={trip.backgroundImgSource}
        />
        <span className="trip-list__flags">
          {trip.getCountriesVisited().map((country) => (
            <CountryFlag
              className="trip-list__flag"
              countryId={country.id}
              key={country.id}
            />
          ))}
        </span>
        <span className="trip-list__caption">
          <span className="trip-list__title">
            {trip.getLocalizedTitle(currLanguage)}
          </span>
          <span className="trip-list__meta">
            {formatDateRangeShort({
              eDateInput: trip.eDate,
              locale: currLanguage,
              sDateInput: trip.sDate,
              showYear: false,
            })}
            {nights > 0
              ? ` · ${t("common:stay.nightsCount", { count: nights })}`
              : null}
          </span>
        </span>
      </button>
    </m.li>
  );
}

/**
 * TripList component
 * Every trip of one year at a time, newest first. Pills along the top switch
 * the year: as many recent years as fit side by side, the last pill holding
 * that year and all before it, so the row never scrolls. The cards slide in
 * from the side the chosen pill sits on, so the row and the motion agree on
 * which way time runs.
 * @component
 * @returns {ReactNode} The trip list
 */
export function TripList(): ReactNode {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { selectedTrip, setSelectedTrip } = useMapInteraction();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const [selection, setSelection] = useState({
    direction: 0,
    year: selectedTrip?.sDate.getFullYear(),
  });
  const buckets = bucketYears(TRIP_YEARS, slots);
  const current =
    (selection.year === undefined
      ? undefined
      : bucketOf(buckets, selection.year)) ?? buckets[0];

  /**
   * Shows a trip's route on the map and opens its itinerary.
   * @param {Trip} trip - The trip
   * @returns {void}
   */
  const openTrip = (trip: Trip): void => {
    setSelectedTrip(trip);
    navigate(`/trip/${encodeURIComponent(trip.id)}`);
  };

  /**
   * Switches to another year, remembering which way along the pills it lies
   * so its cards come in from that side, and starts it from the top.
   * @param {number} year - The year to show
   * @returns {void}
   */
  const selectYear = (year: number): void => {
    if (year === current?.year) return;
    setSelection({
      direction: year < (current?.year ?? year) ? 1 : -1,
      year,
    });
    bodyRef.current?.scrollTo({ top: 0 });
  };

  return (
    <PanelFrame
      bodyRef={bodyRef}
      header={
        <PanelHeader
          subtitle={t("common:tripCount", { count: browsableTrips.length })}
          title={t("trips.title")}
        >
          {current ? (
            <YearPills
              id="trips"
              label={t("trips.chooseYear")}
              onChange={selectYear}
              onMeasure={(widths) =>
                setSlots(fitSlots(widths, TRIP_YEARS.length))
              }
              value={current.year}
              years={buckets.map(({ year, isOrEarlier }) => ({
                ariaLabel: isOrEarlier
                  ? t("trips.orEarlier", { year })
                  : undefined,
                label: isOrEarlier ? `≤ ${year}` : undefined,
                year,
              }))}
            />
          ) : null}
        </PanelHeader>
      }
    >
      {!current ? <EmptyState message={t("trips.empty")} /> : null}
      <div className="trip-list__years">
        <AnimatePresence
          custom={selection.direction}
          initial={false}
          mode="popLayout"
        >
          {current ? (
            <m.ul
              animate="visible"
              className="trip-list__trips"
              custom={selection.direction}
              exit="exit"
              initial="hidden"
              key={current.year}
              variants={slideList}
            >
              {current.trips.map((trip) => (
                <TripCard key={trip.id} onOpen={openTrip} trip={trip} />
              ))}
            </m.ul>
          ) : null}
        </AnimatePresence>
      </div>
    </PanelFrame>
  );
}
