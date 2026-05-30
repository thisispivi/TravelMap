import "./TripBrowser.scss";

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
import { keys } from "remeda";

import { TripCard } from "@/components/molecules";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { Trip } from "@/core";
import { visitedTrips } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { classNames } from "@/utils/className";
import { computeMapCenter } from "@/utils/mapCenter";
import { parameters } from "@/utils/parameters";
import { constants } from "@/utils/parameters";
import { groupTripsByYear } from "@/utils/trips";

const TRIP_YEAR_TRANSITION_DURATION_MS = 280;

/**
 * TripBrowser component
 *
 * Displays visited trips grouped by year. The panel height is
 * `min(content height, max available height)`: it shrinks to fit when trips are
 * few and fills the viewport when they overflow — with a scrollbar only in the
 * latter case.
 *
 * @component
 *
 * @returns {JSX.Element} The trip browser panel
 */
export function TripBrowser(): JSX.Element {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { setSelectedTrip, setMapPosition } = use(HomeContext)!;

  const groups = useMemo(
    () =>
      groupTripsByYear(visitedTrips, {
        cutoffYear: constants.GROUP_BY_CITIES_CUTOFF_YEAR,
      }),
    [],
  );
  const years = useMemo<string[]>(
    () =>
      keys(groups)
        .map(String)
        .sort((a, b) => Number(b) - Number(a)),
    [groups],
  );
  const initialYear = Number(
    years[0] ?? constants.GROUP_BY_CITIES_DEFAULT_OPENED_YEAR,
  );
  const [activeYear, setActiveYear] = useState<number>(initialYear);
  const [panelHeight, setPanelHeight] = useState<string>();
  const [stageHeight, setStageHeight] = useState<string>();
  const [isListScrollable, setIsListScrollable] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeYearIndex = Math.max(years.indexOf(String(activeYear)), 0);
  const selectedTrips = groups[activeYear] ?? [];

  const measure = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const style = window.getComputedStyle(panel);
    const maxHeight = parseFloat(style.maxHeight);
    const header = panel.querySelector<HTMLElement>(".trip-browser__header");
    const yearSelector = panel.querySelector<HTMLElement>(
      ".trip-browser__year-selector",
    );
    const list = panel.querySelector<HTMLElement>(".trip-browser__list");
    const page = panel.querySelector<HTMLElement>(
      `.trip-browser__trips[data-trip-year="${activeYear}"]`,
    );
    const listStyle = list ? window.getComputedStyle(list) : null;
    const pageStyle = page ? window.getComputedStyle(page) : null;
    const cards = page
      ? [...page.querySelectorAll<HTMLElement>(".trip-card")]
      : [];

    const pageHeight =
      page && cards.length > 0
        ? Math.max(
            ...cards.map(
              (card) =>
                card.getBoundingClientRect().bottom -
                page.getBoundingClientRect().top,
            ),
          ) + (pageStyle ? parseFloat(pageStyle.paddingBottom) : 0)
        : (page?.scrollHeight ?? 0);

    const fixedHeight =
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom) +
      (header?.offsetHeight ?? 0) +
      (yearSelector?.offsetHeight ?? 0) +
      (listStyle ? parseFloat(listStyle.paddingTop) : 0) +
      (listStyle ? parseFloat(listStyle.paddingBottom) : 0);

    const contentHeight = fixedHeight + pageHeight;
    const targetHeight = Number.isFinite(maxHeight)
      ? Math.min(contentHeight, maxHeight)
      : contentHeight;
    const availableListHeight = targetHeight - fixedHeight;

    const rootSize =
      parseFloat(window.getComputedStyle(document.documentElement).fontSize) ||
      16;

    setIsListScrollable(pageHeight > availableListHeight + 2);
    setStageHeight((curr) => {
      const next = `${pageHeight / rootSize}rem`;
      return curr === next ? curr : next;
    });
    setPanelHeight((curr) => {
      const next = `${targetHeight / rootSize}rem`;
      return curr === next ? curr : next;
    });
  }, [activeYear]);

  const selectYear = useCallback(
    (year: string) => {
      const next = parseInt(year, 10);
      if (next === activeYear) return;
      setActiveYear(next);
    },
    [activeYear],
  );

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    let frame = window.requestAnimationFrame(measure);

    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(panel);
    window.addEventListener("resize", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [measure]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(measure);
    const timeout = window.setTimeout(() => {
      window.requestAnimationFrame(measure);
    }, TRIP_YEAR_TRANSITION_DURATION_MS + 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [measure, selectedTrips.length]);

  const openTrip = useCallback(
    (trip: Trip) => {
      setSelectedTrip(trip);
      navigate(`/trip/${trip.id}`);
      const zoom = trip.mapFocus?.zoom ?? parameters.map.hoveredCityZoom;
      const rawCenter =
        trip.mapFocus?.center ??
        trip.destinations.find((d) => !d.isLayover)?.city.coordinates ??
        parameters.map.defaultCenter;
      setMapPosition({ center: computeMapCenter(rawCenter, zoom), zoom });
    },
    [navigate, setMapPosition, setSelectedTrip],
  );

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ height: panelHeight ?? "auto", scale: 1, x: 0 }}
        className="trip-browser"
        exit={{ scale: 0.98, x: "-120%" }}
        initial={{ scale: 0.98, x: "-120%" }}
        ref={panelRef}
        transition={{
          height: { duration: 0 },
          scale: { duration: 0.22, ease: [0.35, 0, 0.25, 1] },
          x: { duration: 0.22, ease: [0.35, 0, 0.25, 1] },
        }}
      >
        <div className="trip-browser__header">
          <h2>{t("visited.title")}</h2>
        </div>

        <div className="trip-browser__year-selector">
          {years.map((year, i) => (
            <button
              className={classNames(
                "trip-browser__year-btn",
                activeYear === parseInt(year, 10) &&
                  "trip-browser__year-btn--active",
              )}
              key={year}
              onClick={() => selectYear(year)}
              type="button"
            >
              {i === years.length - 1 ? `≤ ${year}` : year}
            </button>
          ))}
        </div>

        <div
          className={classNames(
            "trip-browser__list",
            isListScrollable && "trip-browser__list--scrollable",
          )}
        >
          <m.div
            animate={{ height: stageHeight ?? "auto" }}
            className="trip-browser__list-stage"
            transition={{ duration: 0 }}
          >
            {years.map((year, index) => (
              <m.div
                animate={{ x: `${(index - activeYearIndex) * 100}%` }}
                className="trip-browser__trips"
                data-trip-year={year}
                initial={false}
                key={year}
                transition={{
                  duration: TRIP_YEAR_TRANSITION_DURATION_MS / 1000,
                  ease: [0.35, 0, 0.25, 1],
                }}
              >
                {(groups[Number(year)] ?? []).map((trip: Trip) => (
                  <TripCard
                    key={trip.id}
                    onSelect={() => openTrip(trip)}
                    trip={trip}
                  />
                ))}
              </m.div>
            ))}
          </m.div>
        </div>
      </m.div>
    </LazyMotion>
  );
}
