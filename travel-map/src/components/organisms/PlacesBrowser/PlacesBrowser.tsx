import "./PlacesBrowser.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { FilterIcon } from "@/assets";
import { FilterByCountry } from "@/components/molecules";
import { HomeContext } from "@/components/pages/Home/HomeContext";
import { Country } from "@/core";
import { futureCities, livedCities, visitedCities } from "@/data";
import { useLanguage } from "@/hooks/language/language";
import { useLocation } from "@/hooks/location/location";

import { SegmentedControl } from "../../atoms";
import { CityCard } from "../../molecules";

type PlacesFilter = "visited" | "lived" | "future";

const placesFilterOrder: PlacesFilter[] = ["visited", "lived", "future"];
const placesTabTransitionDuration = 280;

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

export function PlacesBrowser(): JSX.Element {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { placesFilter } = useLocation();
  const { setHoveredCity, setMapPosition } = useContext(HomeContext)!;

  const [filter, setFilter] = useState<PlacesFilter>(placesFilter ?? "visited");
  const [selectedCountries, setSelectedCountries] = useState<Country[] | null>(
    null,
  );
  const [transitionDirection, setTransitionDirection] = useState(1);
  const [panelHeight, setPanelHeight] = useState<string>();
  const [isGridScrollable, setIsGridScrollable] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const routeUpdateTimeoutRef = useRef<number | null>(null);

  const measurePanelHeight = useCallback(() => {
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
      `.places-browser__grid-page[data-places-filter="${filter}"]`,
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

    setIsGridScrollable(gridPageHeight > availableGridHeight + 1);
    setPanelHeight((currentHeight) =>
      currentHeight === nextHeight ? currentHeight : nextHeight,
    );
  }, [filter]);

  const handleGridExitComplete = useCallback(() => {
    window.requestAnimationFrame(measurePanelHeight);
  }, [measurePanelHeight]);

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

    let frame = window.requestAnimationFrame(measurePanelHeight);
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measurePanelHeight);
    });

    observer.observe(panel);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [measurePanelHeight]);

  const allCities = useMemo(() => {
    switch (filter) {
      case "lived":
        return livedCities;
      case "future":
        return futureCities;
      default:
        return visitedCities;
    }
  }, [filter]);

  const countries = useMemo(() => {
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
  }, [allCities, t]);

  const activeSelected = selectedCountries ?? countries;

  const cities = useMemo(() => {
    const active = selectedCountries ?? countries;
    if (active.length === 0 || active.length === countries.length) {
      return allCities;
    }
    const ids = new Set(active.map((c) => c.id));
    return allCities.filter((c) => ids.has(c.country.id));
  }, [allCities, selectedCountries, countries]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(measurePanelHeight);
    const timeout = window.setTimeout(() => {
      window.requestAnimationFrame(measurePanelHeight);
    }, placesTabTransitionDuration + 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [cities.length, countries.length, filter, measurePanelHeight]);

  const filterOptions: {
    value: PlacesFilter;
    label: string;
    tooltip: string;
  }[] = useMemo(
    () => [
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
    ],
    [t],
  );

  const handleSelect = (nextFilter: PlacesFilter) => {
    if (nextFilter === filter) return;

    setTransitionDirection(
      placesFilterOrder.indexOf(nextFilter) > placesFilterOrder.indexOf(filter)
        ? 1
        : -1,
    );
    setFilter(nextFilter);
    setSelectedCountries(null);

    if (routeUpdateTimeoutRef.current !== null) {
      window.clearTimeout(routeUpdateTimeoutRef.current);
    }

    routeUpdateTimeoutRef.current = window.setTimeout(() => {
      navigate(`/places/${nextFilter}`);
      routeUpdateTimeoutRef.current = null;
    }, placesTabTransitionDuration);
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ height: panelHeight ?? "auto", opacity: 1, x: 0 }}
        className="places-browser"
        exit={{ opacity: 0, x: "-1.25rem" }}
        initial={{ opacity: 0, x: "-1.25rem" }}
        ref={panelRef}
        transition={{
          height: { duration: 0.28, ease: [0.35, 0, 0.25, 1] },
          opacity: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
          x: { type: "spring", stiffness: 400, damping: 30 },
        }}
      >
        <div className="places-browser__header">
          <h2>{t("nav.places")}</h2>
          <div className="places-browser__header-action">
            {countries.length > 1 ? (
              <FilterByCountry
                buttonIcon={<FilterIcon className="filter__icon" />}
                onChange={setSelectedCountries}
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
          selected={filter}
          tooltipId="base-tooltip"
        />

        <div
          className={`places-browser__grid ${
            isGridScrollable ? "places-browser__grid--scrollable" : ""
          }`}
        >
          <div className="places-browser__grid-stage">
            <AnimatePresence
              custom={transitionDirection}
              initial={false}
              onExitComplete={handleGridExitComplete}
            >
              <m.div
                animate="center"
                className={`places-browser__grid-page ${
                  cities.length === 1 ? "places-browser__grid-page--single" : ""
                }`}
                custom={transitionDirection}
                data-places-filter={filter}
                exit="exit"
                initial="enter"
                key={filter}
                transition={{
                  duration: placesTabTransitionDuration / 1000,
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
