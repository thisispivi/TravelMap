import "./TripDetail.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import {
  JSX,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  AirplaneIcon,
  BusIcon,
  CalendarIcon,
  CarIcon,
  FerryIcon,
  TaxiIcon,
  TimezoneIcon,
  TrainIcon,
} from "@/assets";
import { Timeline, TripDetailHero } from "@/components/molecules";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { useLocation } from "@/hooks/location/location";
import { classNames } from "@/utils/className";
import { formatMileage } from "@/utils/format";
import {
  buildTripDetailTimelineItems,
  formatTripDetailDuration,
  TripDetailTimelineItem,
} from "@/utils/tripDetailTimeline";

/**
 * Aggregate transport and stay statistics from a flat list of timeline items.
 * @param {TripDetailTimelineItem[]} items - Timeline items for the trip
 * @returns Counts, distances, and durations grouped by transport mode, plus night count and timezone set
 */
function computeTripStats(items: TripDetailTimelineItem[]) {
  let nights = 0;
  let flights = 0,
    flightKm = 0,
    flightMinutes = 0;
  let ferries = 0,
    ferryKm = 0,
    ferryMinutes = 0;
  let trains = 0,
    trainKm = 0,
    trainMinutes = 0;
  let buses = 0,
    busKm = 0,
    busMinutes = 0;
  let taxis = 0,
    taxiKm = 0,
    taxiMinutes = 0;
  let cars = 0,
    carKm = 0,
    carMinutes = 0;
  let walks = 0,
    walkKm = 0,
    walkMinutes = 0;
  const timezones = new Set<string>();

  for (const item of items) {
    if (item.kind === "base-stop") {
      nights += item.nights;
      if (item.city.timeZone) timezones.add(item.city.timeZone);
    } else if (item.kind === "day-trip") {
      if (item.city.timeZone) timezones.add(item.city.timeZone);
    } else if (item.kind === "transport") {
      const mult = item.isRoundTrip ? 2 : 1;
      if (item.mode === "plane") {
        flights += mult;
        flightKm += (item.flightInfo?.distanceKm ?? 0) * mult;
        flightMinutes += (item.flightInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "ferry") {
        ferries += mult;
        ferryKm += (item.ferryInfo?.distanceKm ?? 0) * mult;
        ferryMinutes += (item.ferryInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "train") {
        trains += mult;
        trainKm += (item.trainInfo?.distanceKm ?? 0) * mult;
        trainMinutes += (item.trainInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "bus") {
        buses += mult;
        busKm += (item.busInfo?.distanceKm ?? 0) * mult;
        busMinutes += (item.busInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "car") {
        cars += mult;
        carKm += (item.carInfo?.distanceKm ?? 0) * mult;
        carMinutes += (item.carInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "taxi") {
        taxis += mult;
        taxiKm += (item.taxiInfo?.distanceKm ?? 0) * mult;
        taxiMinutes += (item.taxiInfo?.durationMinutes ?? 0) * mult;
      } else if (item.mode === "walk") {
        walks += mult;
        walkKm += (item.walkInfo?.distanceKm ?? 0) * mult;
        walkMinutes += (item.walkInfo?.durationMinutes ?? 0) * mult;
      }
    }
  }

  return {
    nights,
    flights,
    flightKm,
    flightMinutes,
    ferries,
    ferryKm,
    ferryMinutes,
    trains,
    trainKm,
    trainMinutes,
    buses,
    busKm,
    busMinutes,
    taxis,
    taxiKm,
    taxiMinutes,
    cars,
    carKm,
    carMinutes,
    walks,
    walkKm,
    walkMinutes,
    timezoneCount: timezones.size,
  };
}

/**
 * TripDetail component
 *
 * Floating panel showing the full route timeline and transport stats for
 * the selected trip. Slides in from the left and persists the trip in
 * HomeContext so the route overlay stays visible on the map.
 *
 * @component
 *
 * @returns {JSX.Element | null} The trip detail panel, or null when no trip is selected
 */
export function TripDetail(): JSX.Element | null {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { tripDetailId } = useLocation();
  const { selectedTrip, setSelectedTrip } = use(HomeContext)!;
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [isBodyScrollable, setIsBodyScrollable] = useState(false);

  const trip = useMemo(
    () =>
      selectedTrip ?? visitedTrips.find((tr) => tr.id === tripDetailId) ?? null,
    [selectedTrip, tripDetailId],
  );

  useEffect(() => {
    if (trip && selectedTrip?.id !== trip.id) setSelectedTrip(trip);
  }, [selectedTrip?.id, setSelectedTrip, trip]);

  const timelineItems = useMemo(
    () => (trip ? buildTripDetailTimelineItems(trip) : []),
    [trip],
  );

  const updateBodyScrollable = useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    setIsBodyScrollable(body.scrollHeight > body.clientHeight + 1);
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    updateBodyScrollable();

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateBodyScrollable);
    observer?.observe(body);
    window.addEventListener("resize", updateBodyScrollable);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateBodyScrollable);
    };
  }, [updateBodyScrollable, timelineItems]);

  const showYear = trip
    ? trip.sDate.getFullYear() !== trip.eDate.getFullYear()
    : false;

  const stats = useMemo(() => computeTripStats(timelineItems), [timelineItems]);

  if (!trip) return null;

  const countries = trip.getCountriesVisited();

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ scale: 1, x: 0 }}
        className="trip-detail"
        exit={{ scale: 0.98, x: "-120%" }}
        initial={{ scale: 0.98, x: "-120%" }}
        key={trip.id}
        layout="position"
        transition={{ duration: 0.22, ease: [0.35, 0, 0.25, 1] }}
      >
        <TripDetailHero
          countries={countries}
          onBack={() => {
            setSelectedTrip(null);
            navigate("/trips");
          }}
          trip={trip}
        />

        <div className="trip-detail__stats">
          {trip.getDurationInDays() > 0 ? (
            <span className="trip-detail__stat-pill">
              <CalendarIcon className="trip-detail__stat-pill-icon" />
              {trip.getDurationInDays()}{" "}
              {trip.getDurationInDays() === 1
                ? t("tripDetail.day")
                : t("tripDetail.days")}
            </span>
          ) : null}
          {stats.flights > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--plane">
              <AirplaneIcon className="trip-detail__stat-pill-icon" />
              {stats.flights}{" "}
              {stats.flights === 1
                ? t("tripDetail.flight")
                : t("tripDetail.flights")}
              {stats.flightKm > 0
                ? ` · ${formatMileage(stats.flightKm, lang)} km`
                : ""}
              {stats.flightMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.flightMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.ferries > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--ferry">
              <FerryIcon className="trip-detail__stat-pill-icon" />
              {stats.ferries}{" "}
              {stats.ferries === 1
                ? t("tripDetail.ferry")
                : t("tripDetail.ferries")}
              {stats.ferryKm > 0
                ? ` · ${formatMileage(stats.ferryKm, lang)} km`
                : ""}
              {stats.ferryMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.ferryMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.trains > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--train">
              <TrainIcon className="trip-detail__stat-pill-icon" />
              {stats.trains}{" "}
              {stats.trains === 1
                ? t("tripDetail.train")
                : t("tripDetail.trains")}
              {stats.trainKm > 0
                ? ` · ${formatMileage(stats.trainKm, lang)} km`
                : ""}
              {stats.trainMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.trainMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.buses > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--bus">
              <BusIcon className="trip-detail__stat-pill-icon" />
              {stats.buses}{" "}
              {stats.buses === 1 ? t("tripDetail.bus") : t("tripDetail.buses")}
              {stats.busKm > 0
                ? ` · ${formatMileage(stats.busKm, lang)} km`
                : ""}
              {stats.busMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.busMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.cars > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--car">
              <CarIcon className="trip-detail__stat-pill-icon" />
              {stats.cars}{" "}
              {stats.cars === 1
                ? t("tripDetail.drive")
                : t("tripDetail.drives")}
              {stats.carKm > 0
                ? ` · ${formatMileage(stats.carKm, lang)} km`
                : ""}
              {stats.carMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.carMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.taxis > 0 ? (
            <span className="trip-detail__stat-pill trip-detail__stat-pill--taxi">
              <TaxiIcon className="trip-detail__stat-pill-icon" />
              {stats.taxis}{" "}
              {stats.taxis === 1 ? t("tripDetail.taxi") : t("tripDetail.taxis")}
              {stats.taxiKm > 0
                ? ` · ${formatMileage(stats.taxiKm, lang)} km`
                : ""}
              {stats.taxiMinutes > 0
                ? ` · ~${formatTripDetailDuration(stats.taxiMinutes)}`
                : ""}
            </span>
          ) : null}
          {stats.timezoneCount > 1 ? (
            <span className="trip-detail__stat-pill">
              <TimezoneIcon className="trip-detail__stat-pill-icon" />
              {stats.timezoneCount}{" "}
              {stats.timezoneCount === 1
                ? t("tripDetail.timeZone")
                : t("tripDetail.timeZones")}
            </span>
          ) : null}
        </div>

        <div
          className={classNames(
            "trip-detail__body",
            isBodyScrollable && "trip-detail__body--scrollable",
          )}
          ref={bodyRef}
        >
          <p className="trip-detail__route-label">{t("tripDetail.route")}</p>
          <Timeline items={timelineItems} showYear={showYear} />
        </div>
      </m.div>
    </LazyMotion>
  );
}
