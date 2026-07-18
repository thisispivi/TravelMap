import "./PlacesBrowser.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, use, useEffect, useReducer, useRef } from "react";
import { useNavigate } from "react-router-dom";

import FilterIcon from "@/assets/icons/Filter.svg?react";
import { SegmentedControl } from "@/components/atoms/SegmentedControl/SegmentedControl";
import { CityCard } from "@/components/molecules/Cards/CityCard";
import { FilterByCountry } from "@/components/molecules/FilterByCountry/FilterByCountry";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { Country } from "@/core";
import { futureCities, livedCities, visitedCities } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { useLocation } from "@/hooks/location/location";
import { classNames } from "@/utils/className";

type PlacesFilter = "visited" | "lived" | "future";
type PlacesState = {
  filter: PlacesFilter;
  selectedCountries: Country[] | null;
  transitionDirection: number;
  panelHeight?: string;
  isGridScrollable: boolean;
};
type PlacesAction =
  | { type: "selectFilter"; filter: PlacesFilter; direction: number }
  | { type: "selectedCountries"; countries: Country[] | null }
  | { type: "layoutMeasured"; panelHeight: string; isGridScrollable: boolean };

const placesFilterOrder: PlacesFilter[] = ["visited", "lived", "future"];
const PLACES_TAB_TRANSITION_DURATION_MS = 280;
const gridPageVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "100%" : "-100%",
  }),
  center: {
    opacity: 1,
    x: "0%",
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "-100%" : "100%",
  }),
};

function placesReducer(state: PlacesState, action: PlacesAction): PlacesState {
  switch (action.type) {
    case "selectFilter":
      return {
        ...state,
        filter: action.filter,
        selectedCountries: null,
        transitionDirection: action.direction,
      };
    case "selectedCountries":
      return { ...state, selectedCountries: action.countries };
    case "layoutMeasured":
      return state.panelHeight === action.panelHeight &&
        state.isGridScrollable === action.isGridScrollable
        ? state
        : {
            ...state,
            panelHeight: action.panelHeight,
            isGridScrollable: action.isGridScrollable,
          };
  }
}

/**
 * PlacesBrowser component
 *
 * Displays cities in a filterable grid, segmented by category (Visited, Lived,
 * Future). Supports optional country filtering via a dropdown. The panel height
 * adapts to the active grid page, and tabs slide with a directional animation.
 *
 * @component
 *
 * @returns {ReactNode} The places browser panel
 */
export function PlacesBrowser(): ReactNode {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { placesFilter } = useLocation();
  const { setHoveredCity, setMapPosition } = use(HomeContext)!;
  const [state, dispatch] = useReducer(placesReducer, {
    filter: placesFilter ?? "visited",
    selectedCountries: null,
    transitionDirection: 1,
    isGridScrollable: false,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const routeUpdateTimeoutRef = useRef<number | null>(null);
  const measurePanelHeight = () => {
    const panel = panelRef.current;
    if (!panel) return;
    const style = window.getComputedStyle(panel);
    const maxHeight = parseFloat(style.maxHeight);
    const header = panel.querySelector<HTMLElement>(".places-browser__header");
    const filterControl = panel.querySelector<HTMLElement>(
      ".places-browser__filter",
    );
    const grid = panel.querySelector<HTMLElement>(".places-browser__grid");
    const gridPage = panel.querySelector<HTMLElement>(
      `.places-browser__grid-page[data-places-filter="${state.filter}"]`,
    );
    const filterStyle = filterControl
      ? window.getComputedStyle(filterControl)
      : null;
    const gridStyle = grid ? window.getComputedStyle(grid) : null;
    const cards = gridPage
      ? [...gridPage.querySelectorAll<HTMLElement>(".city-card")]
      : [];
    const gridPageHeight =
      gridPage && cards.length > 0
        ? Math.max(
            ...cards.map(
              (card) =>
                card.getBoundingClientRect().bottom -
                gridPage.getBoundingClientRect().top,
            ),
          )
        : (gridPage?.scrollHeight ?? 0);
    const fixedHeight =
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom) +
      (header?.offsetHeight ?? 0) +
      (filterControl?.offsetHeight ?? 0) +
      (filterStyle ? parseFloat(filterStyle.marginBottom) : 0) +
      (gridStyle ? parseFloat(gridStyle.paddingTop) : 0) +
      (gridStyle ? parseFloat(gridStyle.paddingBottom) : 0);
    const contentHeight = fixedHeight + gridPageHeight;
    const targetHeight = Number.isFinite(maxHeight)
      ? Math.min(contentHeight, maxHeight)
      : contentHeight;
    const availableGridHeight = targetHeight - fixedHeight;
    const rootSize =
      parseFloat(window.getComputedStyle(document.documentElement).fontSize) ||
      16;
    const nextHeight = `${targetHeight / rootSize}rem`;
    dispatch({
      type: "layoutMeasured",
      panelHeight: nextHeight,
      isGridScrollable: gridPageHeight > availableGridHeight + 1,
    });
  };
  const measurePanelHeightRef = useRef(measurePanelHeight);

  useEffect(() => {
    measurePanelHeightRef.current = measurePanelHeight;
  });

  const handleGridExitComplete = () => {
    window.requestAnimationFrame(() => measurePanelHeightRef.current());
  };
  useEffect(
    () => () => {
      if (routeUpdateTimeoutRef.current !== null) {
        window.clearTimeout(routeUpdateTimeoutRef.current);
      }
    },
    [],
  );
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    let frame = window.requestAnimationFrame(() =>
      measurePanelHeightRef.current(),
    );
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() =>
        measurePanelHeightRef.current(),
      );
    });
    observer.observe(panel);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);
  const allCities = (() => {
    switch (state.filter) {
      case "lived":
        return livedCities;
      case "future":
        return futureCities;
      default:
        return visitedCities;
    }
  })();
  const countries = (() => {
    const seen = new Set<string>();
    const result: Country[] = [];
    for (const city of allCities) {
      if (!seen.has(city.country.id)) {
        seen.add(city.country.id);
        result.push(city.country);
      }
    }
    const key = (id: string) => id.replace(/\s+/g, "");
    return result.sort((a, b) =>
      t(`countries.${key(a.id)}`).localeCompare(t(`countries.${key(b.id)}`)),
    );
  })();
  const activeSelected = state.selectedCountries ?? countries;
  const cities = (() => {
    const active = state.selectedCountries ?? countries;
    if (active.length === 0 || active.length === countries.length) {
      return allCities;
    }
    const ids = new Set(active.map((c) => c.id));
    return allCities.filter((c) => ids.has(c.country.id));
  })();
  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      measurePanelHeightRef.current(),
    );
    const timeout = window.setTimeout(() => {
      window.requestAnimationFrame(() => measurePanelHeightRef.current());
    }, PLACES_TAB_TRANSITION_DURATION_MS + 80);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [cities.length, countries.length, state.filter]);
  const filterOptions: {
    value: PlacesFilter;
    label: string;
    tooltip: string;
  }[] = [
    {
      value: "visited",
      label: t("places.visited"),
      tooltip: t("places.tooltips.visited"),
    },
    {
      value: "lived",
      label: t("places.lived"),
      tooltip: t("places.tooltips.lived"),
    },
    {
      value: "future",
      label: t("places.future"),
      tooltip: t("places.tooltips.future"),
    },
  ];
  const handleSelect = (nextFilter: PlacesFilter) => {
    if (nextFilter === state.filter) return;
    const direction =
      placesFilterOrder.indexOf(nextFilter) >
      placesFilterOrder.indexOf(state.filter)
        ? 1
        : -1;
    dispatch({ type: "selectFilter", filter: nextFilter, direction });
    if (routeUpdateTimeoutRef.current !== null) {
      window.clearTimeout(routeUpdateTimeoutRef.current);
    }
    routeUpdateTimeoutRef.current = window.setTimeout(() => {
      navigate(`/places/${nextFilter}`);
      routeUpdateTimeoutRef.current = null;
    }, PLACES_TAB_TRANSITION_DURATION_MS);
  };
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ scale: 1, x: 0 }}
        className="places-browser"
        exit={{ scale: 0.98, x: "-120%" }}
        initial={{ scale: 0.98, x: "-120%" }}
        layout="size"
        ref={panelRef}
        style={{ height: state.panelHeight ?? "auto" }}
        transition={{
          layout: { duration: 0.2, ease: [0.35, 0, 0.25, 1] },
          scale: { duration: 0.22, ease: [0.35, 0, 0.25, 1] },
          x: { duration: 0.22, ease: [0.35, 0, 0.25, 1] },
        }}
      >
        <div className="places-browser__header">
          <h2>{t("nav.places")}</h2>
          <div className="places-browser__header-action">
            {countries.length > 1 ? (
              <FilterByCountry
                buttonIcon={<FilterIcon className="filter__icon" />}
                onChange={(countries) =>
                  dispatch({ type: "selectedCountries", countries })
                }
                options={countries}
                selected={activeSelected}
              />
            ) : null}
          </div>
        </div>

        <SegmentedControl
          className="places-browser__filter"
          layoutId="places-filter"
          onSelect={handleSelect}
          options={filterOptions}
          selected={state.filter}
          tooltipId="base-tooltip"
        />

        <div
          className={classNames(
            "places-browser__grid",
            state.isGridScrollable && "places-browser__grid--scrollable",
          )}
        >
          <div className="places-browser__grid-stage">
            <AnimatePresence
              custom={state.transitionDirection}
              initial={false}
              onExitComplete={handleGridExitComplete}
            >
              <m.div
                animate="center"
                className={classNames(
                  "places-browser__grid-page",
                  cities.length === 1 && "places-browser__grid-page--single",
                )}
                custom={state.transitionDirection}
                data-places-filter={state.filter}
                exit="exit"
                initial="enter"
                key={state.filter}
                transition={{
                  duration: PLACES_TAB_TRANSITION_DURATION_MS / 1000,
                  ease: [0.35, 0, 0.25, 1],
                }}
                variants={gridPageVariants}
              >
                {cities.map((city) => (
                  <CityCard
                    city={city}
                    isClickable
                    key={city.name}
                    setHoveredCity={setHoveredCity}
                    setMapPosition={setMapPosition}
                  />
                ))}
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
}
