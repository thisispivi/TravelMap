import "./PlacesBrowser.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, useContext, useMemo, useState } from "react";
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

export function PlacesBrowser(): JSX.Element {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { placesFilter } = useLocation();
  const { setHoveredCity, setMapPosition } = useContext(HomeContext)!;

  const [filter, setFilter] = useState<PlacesFilter>(placesFilter ?? "visited");
  const [selectedCountries, setSelectedCountries] = useState<Country[] | null>(
    null,
  );

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
    setFilter(nextFilter);
    setSelectedCountries(null);
    navigate(`/places/${nextFilter}`);
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        animate={{ opacity: 1, x: 0 }}
        className="places-browser"
        exit={{ opacity: 0, x: "-1.25rem" }}
        initial={{ opacity: 0, x: "-1.25rem" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
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

        <div className="places-browser__grid">
          <AnimatePresence mode="wait">
            <m.div
              animate={{ opacity: 1, x: 0 }}
              className={`places-browser__grid-page ${
                cities.length === 1 ? "places-browser__grid-page--single" : ""
              }`}
              exit={{ opacity: 0, x: "-1.5rem" }}
              initial={{ opacity: 0, x: "-1.5rem" }}
              key={filter}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
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
      </m.div>
    </LazyMotion>
  );
}
