import "./RecordIndex.scss";

import { Country, getCitiesBearing, getCitiesDistance } from "@travelmap/core";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router";

import FilterIcon from "@/assets/icons/Filter.svg?react";
import {
  futureCities,
  futureTrips,
  livedCities,
  visitedCities,
  visitedTrips,
} from "@/data/world";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { SegmentedControl } from "@/shared/components/SegmentedControl/SegmentedControl";
import {
  JourneyOrder,
  PlacesFilter,
  useAppRoute,
} from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { reckonAll, resolveOrigin } from "@/shared/lib/bearings";
import { classNames } from "@/shared/lib/classNames";

import { countCityVisits } from "../../lib/cityVisits";
import { groupJourneys } from "../../lib/journeyGroups";
import { CityCard } from "../CityCard/CityCard";
import { FilterByCountry } from "../FilterByCountry/FilterByCountry";
import { JourneyRow } from "../JourneyRow/JourneyRow";

/* A place stayed in more than once earns the wider plate. */
const RETURNED_VISIT_THRESHOLD = 2;

/** The two readings of the record, which double as its title. */
const MODES = ["journeys", "places"] as const;

/**
 * RecordIndex component
 * The record itself, read either as journeys or as places. Journeys can be
 * ordered by when they happened, by the direction they set off in, or by how
 * far out they reached; the last two exist because a record measured from one
 * home has a shape those orderings reveal and a date-sorted list hides.
 * @component
 * @returns {ReactNode} The record index
 */
export function RecordIndex(): ReactNode {
  const { t, currLanguage: lang } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { isPlaces, journeyOrder, placesFilter } = useAppRoute();
  const { setHoveredCity, setMapPosition } = useMapInteraction();
  const [selectedCountries, setSelectedCountries] = useState<Country[] | null>(
    null,
  );
  const origin = resolveOrigin();

  /**
   * Switches between reading the record as journeys and as places.
   * @param {"journeys" | "places"} mode - The requested reading
   * @returns {void}
   */
  const handleMode = (mode: (typeof MODES)[number]): void => {
    setSelectedCountries(null);
    navigate(mode === "places" ? "/places" : "/trips");
  };

  /**
   * Reorders the journeys.
   * @param {JourneyOrder} order - The requested ordering
   * @returns {void}
   */
  const handleOrder = (order: JourneyOrder): void => {
    navigate(`/trips/${order}`);
  };

  /**
   * Switches which set of places the record shows.
   * @param {PlacesFilter} filter - The requested set of places
   * @returns {void}
   */
  const handleFilter = (filter: PlacesFilter): void => {
    setSelectedCountries(null);
    navigate(`/places/${filter}`);
  };

  const allCities = isPlaces
    ? placesFilter === "lived"
      ? livedCities
      : placesFilter === "future"
        ? futureCities
        : visitedCities
    : [];
  const countries = [
    ...new Map(
      allCities.map((city) => [city.country.id, city.country]),
    ).values(),
  ].sort((first, second) =>
    first.getLocalizedName(lang).localeCompare(second.getLocalizedName(lang)),
  );
  const activeCountries = selectedCountries ?? countries;
  const countryIds = new Set(activeCountries.map((country) => country.id));
  const cities =
    activeCountries.length === countries.length
      ? allCities
      : allCities.filter((city) => countryIds.has(city.country.id));
  const plates = countCityVisits(cities, visitedTrips);
  const groups = origin
    ? groupJourneys(
        reckonAll([...visitedTrips, ...futureTrips], origin),
        journeyOrder,
      )
    : [];

  return (
    <div className="record">
      <div className="record__head">
        <h1 className="record__mode">
          {MODES.map((mode) => (
            <button
              aria-current={(mode === "places") === isPlaces}
              className={classNames(
                "record__mode-option",
                (mode === "places") === isPlaces &&
                  "record__mode-option--active",
              )}
              key={mode}
              onClick={() => handleMode(mode)}
              type="button"
            >
              {t(`record.${mode}`)}
            </button>
          ))}
        </h1>

        {isPlaces && countries.length > 1 ? (
          <FilterByCountry
            buttonIcon={<FilterIcon className="filter__icon" />}
            onChange={setSelectedCountries}
            options={countries}
            selected={activeCountries}
          />
        ) : null}
      </div>

      {isPlaces ? (
        <SegmentedControl
          className="record__lens"
          layoutId="record-lens"
          onSelect={handleFilter}
          options={[
            { value: "visited" as const, label: t("places.visited") },
            { value: "lived" as const, label: t("places.lived") },
            { value: "future" as const, label: t("places.future") },
          ]}
          selected={placesFilter}
        />
      ) : (
        <SegmentedControl
          className="record__lens"
          layoutId="record-lens"
          onSelect={handleOrder}
          options={[
            { value: "when" as const, label: t("record.when") },
            { value: "where" as const, label: t("record.where") },
            { value: "far" as const, label: t("record.far") },
          ]}
          selected={journeyOrder}
        />
      )}

      {isPlaces ? (
        <div className="record__plates">
          {plates.length > 0 ? (
            plates.map(({ city, visits }) => (
              <CityCard
                bearing={origin ? getCitiesBearing(origin, city) : undefined}
                city={city}
                distanceKm={
                  origin ? getCitiesDistance(origin, city) : undefined
                }
                isClickable
                isReturned={visits >= RETURNED_VISIT_THRESHOLD}
                key={city.id}
                setHoveredCity={setHoveredCity}
                setMapPosition={setMapPosition}
              />
            ))
          ) : (
            <EmptyState message={t(`places.empty.${placesFilter}`)} />
          )}
        </div>
      ) : groups.length > 0 ? (
        <div className="record__groups">
          {groups.map((group) => (
            <section className="record__group" key={group.key}>
              {group.label ? (
                <h2 className="record__group-label figure">{group.label}</h2>
              ) : null}
              <ul className="record__list">
                {group.entries.map((entry) => (
                  <JourneyRow
                    entry={entry}
                    key={entry.trip.id}
                    showReach={journeyOrder === "far"}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState message={t("visited.empty")} />
      )}
    </div>
  );
}
