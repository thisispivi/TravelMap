import "./TripBrowser.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, useCallback, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { keys } from "remeda";

import { TripCard } from "@/components/molecules";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { Trip } from "@/core";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { constants } from "@/utils/parameters";
import { groupTripsByYear } from "@/utils/trips";

export function TripBrowser(): JSX.Element {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { setSelectedTrip } = useContext(HomeContext)!;

  const groups = useMemo(
    () =>
      groupTripsByYear(visitedTrips, {
        cutoffYear: constants.GROUP_BY_CITIES_CUTOFF_YEAR,
      }),
    [],
  );
  const years = useMemo(
    () => keys(groups).sort((a, b) => Number(b) - Number(a)),
    [groups],
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    Number(years[0] ?? constants.GROUP_BY_CITIES_DEFAULT_OPENED_YEAR),
  );
  const [direction, setDirection] = useState<1 | -1>(1);

  const selectYear = useCallback(
    (year: string) => {
      const next = parseInt(year);
      setDirection(next < selectedYear ? -1 : 1);
      setSelectedYear(next);
    },
    [selectedYear],
  );

  const openTrip = useCallback(
    (trip: Trip) => {
      setSelectedTrip(trip);
      navigate(`/trip/${trip.id}`);
    },
    [navigate, setSelectedTrip],
  );

  return (
    <LazyMotion features={domAnimation}>
      <div className="trip-browser">
        <div className="trip-browser__header">
          <h2>{t("visited.title")}</h2>
        </div>

        <div className="trip-browser__year-selector">
          {years.map((year, i) => (
            <button
              className={`trip-browser__year-btn ${selectedYear === parseInt(year) ? "trip-browser__year-btn--active" : ""}`}
              key={year}
              onClick={() => selectYear(year)}
              type="button"
            >
              {i === years.length - 1 ? `≤ ${year}` : year}
            </button>
          ))}
        </div>

        <div className="trip-browser__list">
          <AnimatePresence custom={direction} mode="wait">
            <m.div
              animate="center"
              className="trip-browser__trips"
              custom={direction}
              exit="exit"
              initial="enter"
              key={selectedYear}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              variants={{
                enter: (dir: number) => ({
                  opacity: 0,
                  x: dir === 1 ? "2.5rem" : "-2.5rem",
                }),
                center: { opacity: 1, x: 0 },
                exit: (dir: number) => ({
                  opacity: 0,
                  x: dir === 1 ? "-2.5rem" : "2.5rem",
                }),
              }}
            >
              {(groups[selectedYear] ?? []).map((trip: Trip) => (
                <TripCard
                  key={trip.id}
                  onSelect={() => openTrip(trip)}
                  trip={trip}
                />
              ))}
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  );
}
