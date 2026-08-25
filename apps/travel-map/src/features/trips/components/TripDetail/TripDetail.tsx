import "./TripDetail.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import ChevronIcon from "@/assets/icons/Chevron.svg?react";
import TimezoneIcon from "@/assets/icons/Timezone.svg?react";
import { futureTrips, visitedTrips } from "@/data/world";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { isPanelLoadingVisible } from "@/shared/components/PanelLoading/PanelLoading.state";
import { TransportModeIcon } from "@/shared/components/TransportModeIcon/TransportModeIcon";
import { useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { usePanel } from "@/shared/context/Panel.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { formatMileage } from "@/shared/lib/format";

import {
  buildTripDetailTimelineItems,
  computeTripStats,
  getTotalKm,
  getTransportSummaries,
} from "../../lib/tripDetailTimeline";
import { TripDetailHero } from "../TripDetailHero/TripDetailHero";
import { TripTimeline } from "../TripTimeline/TripTimeline";

/**
 * TripDetail component
 * Floating panel showing the full route timeline and transport stats for
 * the selected trip. Slides in from the left and persists the trip in
 * shell-owned map interaction state so the route overlay stays visible.
 * @component
 * @returns {ReactNode} The trip detail panel, or a not-found notice for an
 * id that no longer resolves
 */
export function TripDetail(): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { tripDetailId } = useAppRoute();
  const { hoveredCity, selectedTrip, setSelectedTrip } = useMapInteraction();
  const { setIsPanelOpen } = usePanel();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [skipEntrance] = useState(isPanelLoadingVisible);
  const [isBodyScrollable, setIsBodyScrollable] = useState(false);
  /*
   * The URL is what decides which trip this is: reading the shell's selection
   * first would keep showing the previous trip when the route changes under it,
   * as browser history does. Planned trips are absent from the browsable list
   * but still have to resolve from a link, so the lookup spans both records.
   */
  const trip =
    [...visitedTrips, ...futureTrips].find((tr) => tr.id === tripDetailId) ??
    null;
  useEffect(() => {
    if (trip && selectedTrip?.id !== trip.id) setSelectedTrip(trip);
  }, [selectedTrip?.id, setSelectedTrip, trip]);
  const timelineItems = trip ? buildTripDetailTimelineItems(trip) : [];

  /**
   * Recomputes whether the trip detail body overflows its container, so the
   * scroll-shadow/back-to-trip affordances only show up when there's
   * actually more content to scroll to.
   * @returns {void}
   */
  const updateBodyScrollable = () => {
    const body = bodyRef.current;
    if (!body) return;
    setIsBodyScrollable(body.scrollHeight > body.clientHeight + 1);
  };
  const updateBodyScrollableRef = useRef(updateBodyScrollable);

  useEffect(() => {
    updateBodyScrollableRef.current = updateBodyScrollable;
  });

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    /**
     * Recalculates whether the trip-detail body can scroll.
     * @returns {void}
     */
    const handleScrollableChange = (): void =>
      updateBodyScrollableRef.current();

    handleScrollableChange();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleScrollableChange);
    observer?.observe(body);
    window.addEventListener("resize", handleScrollableChange);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", handleScrollableChange);
    };
  }, [trip?.id]);

  /*
   * Highlighting a marker on the map should reveal the matching stay, but a
   * pointer inside the panel means the highlight started here — scrolling then
   * would yank the row out from under the cursor.
   */
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !hoveredCity || body.matches(":hover")) return;

    body
      .querySelector(`[data-city="${CSS.escape(hoveredCity.name)}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [hoveredCity]);

  /**
   * Returns to the trip list, releasing the map from this trip's route.
   * @returns {void}
   */
  const goToTrips = (): void => {
    setSelectedTrip(null);
    void navigate("/trips");
  };
  const showYear = trip
    ? trip.sDate.getFullYear() !== trip.eDate.getFullYear()
    : false;
  const stats = computeTripStats(timelineItems);
  const transportSummaries = getTransportSummaries(stats);
  if (!trip) {
    return (
      <div className="trip-detail">
        <button className="trip-detail__back" onClick={goToTrips} type="button">
          <ChevronIcon
            aria-hidden="true"
            className="trip-detail__back-chevron"
          />
          <span>{t("visited.title")}</span>
        </button>
        <EmptyState
          hint={t("tripDetail.notFoundHint")}
          message={t("tripDetail.notFound")}
        />
      </div>
    );
  }
  const countries = trip.getCountriesVisited();
  const days = trip.getDurationInDays();
  const totalKm = getTotalKm(stats);
  const facts = [
    { key: "days", count: days, one: "day", other: "days" },
    { key: "nights", count: stats.nights, one: "night", other: "nights" },
    { key: "cities", count: stats.cities, one: "city", other: "cities" },
    {
      key: "countries",
      count: countries.length,
      one: "country",
      other: "countries",
    },
  ]
    .filter((fact) => fact.count > 0)
    .map((fact) => ({
      key: fact.key,
      text: `${fact.count} ${t(
        `tripDetail.${fact.count === 1 ? fact.one : fact.other}`,
      )}`,
    }));
  if (totalKm > 0) {
    facts.push({ key: "distance", text: `${formatMileage(totalKm, lang)} km` });
  }
  const hasTransportRow =
    transportSummaries.length > 0 || stats.timezoneCount > 1;
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ scale: 1, x: 0 }}
        className="trip-detail"
        exit={{ scale: 0.98, x: "-120%" }}
        initial={skipEntrance ? false : { scale: 0.98, x: "-120%" }}
        key={trip.id}
        layout="position"
        transition={{ duration: 0.22, ease: [0.35, 0, 0.25, 1] }}
      >
        <TripDetailHero
          countries={countries}
          onBack={goToTrips}
          onViewMap={() => setIsPanelOpen(false)}
          trip={trip}
        />

        <div className="trip-detail__summary">
          <p className="trip-detail__facts">
            {facts.map((fact) => (
              <span className="trip-detail__fact" key={fact.key}>
                {fact.text}
              </span>
            ))}
          </p>

          {hasTransportRow ? (
            <div className="trip-detail__transport">
              {transportSummaries.map((summary) => (
                <span
                  className={`trip-detail__transport-chip trip-detail__transport-chip--${summary.mode}`}
                  key={summary.mode}
                >
                  <TransportModeIcon
                    className="trip-detail__transport-chip-icon"
                    label={t(`tripDetail.${summary.nounKey}`)}
                    mode={summary.mode}
                  />
                  {summary.count}
                </span>
              ))}
              {stats.timezoneCount > 1 ? (
                <span className="trip-detail__transport-chip">
                  <TimezoneIcon
                    aria-label={t("tripDetail.timeZones")}
                    className="trip-detail__transport-chip-icon"
                    role="img"
                  />
                  {stats.timezoneCount}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          className={classNames(
            "trip-detail__body",
            isBodyScrollable && "trip-detail__body--scrollable",
          )}
          ref={bodyRef}
        >
          <TripTimeline items={timelineItems} showYear={showYear} />
        </div>
      </m.div>
    </LazyMotion>
  );
}
