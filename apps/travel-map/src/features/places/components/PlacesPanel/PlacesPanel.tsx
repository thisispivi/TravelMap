import "./PlacesPanel.scss";

import { City } from "@travelmap/core";
import { Checkbox } from "@travelmap/ui/components/Checkbox/Checkbox";
import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { CoverImage } from "@travelmap/ui/components/CoverImage/CoverImage";
import { PanelFrame } from "@travelmap/ui/components/PanelFrame/PanelFrame";
import { Popover } from "@travelmap/ui/components/Popover/Popover";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { classNames } from "@travelmap/ui/lib/classNames";
import { staggerItem, staggerList } from "@travelmap/ui/lib/motion";
import { m } from "framer-motion";
import { ChevronDown, Images, ListFilter } from "lucide-react";
import { ReactNode, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { placePhotoCount } from "@/data/albums";
import {
  futureCities,
  livedCities,
  visitedCities,
  visitedTrips,
} from "@/data/world";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { SegmentedControl } from "@/shared/components/SegmentedControl/SegmentedControl";
import { PlacesFilter, useAppRoute } from "@/shared/context/AppRoute.context";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { usePanel } from "@/shared/context/Panel.context";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { parameters } from "@/shared/lib/parameters";

import { cityVisits, CountryGroup, groupByCountry } from "../../lib/places";

const CITIES: Record<PlacesFilter, City[]> = {
  future: futureCities,
  lived: livedCities,
  visited: visitedCities,
};

/**
 * Properties accepted by the CityCard component.
 * @property {City} city - The city
 * @property {PlacesFilter} filter - Which list the card is in, which decides its caption
 * @property {(city: City) => void} onFocus - Shows the city on the map
 */
interface CityCardProps {
  city: City;
  filter: PlacesFilter;
  onFocus: (city: City) => void;
}

/**
 * CityCard component
 * A city with its picture and, for visited places, how often and how long it
 * was visited. Pressing it shows the city on the map; the corner button opens
 * its photos.
 * @component
 * @param {CityCardProps} props - The card props
 * @param {City} props.city - The city
 * @param {PlacesFilter} props.filter - Which list the card is in
 * @param {(city: City) => void} props.onFocus - Shows the city on the map
 * @returns {ReactNode} The city card
 */
function CityCard({ city, filter, onFocus }: CityCardProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { setHoveredCity } = useMapInteraction();
  const name = city.getLocalizedName(currLanguage);
  const photoCount = filter === "visited" ? placePhotoCount(city) : 0;
  const { visits, nights } = cityVisits(city, visitedTrips);

  return (
    <m.li className="city-card" variants={staggerItem}>
      <button
        aria-label={t("places.showOnMap", { city: name })}
        className="city-card__main"
        onClick={() => onFocus(city)}
        onMouseEnter={() => setHoveredCity(city)}
        onMouseLeave={() => setHoveredCity(null)}
        type="button"
      >
        <CoverImage
          className="city-card__image"
          src={city.getBackgroundImgSourceByIndex(0)}
        />
        <span className="city-card__caption">
          <span className="city-card__name">{name}</span>
          {filter === "visited" ? (
            <span className="city-card__meta">
              {t("places.visits", { count: visits })}
              {nights > 0
                ? ` · ${t("common:stay.nightsCount", { count: nights })}`
                : null}
            </span>
          ) : null}
        </span>
      </button>
      {photoCount > 0 ? (
        <button
          aria-label={t("places.openPhotos", { city: name })}
          className="city-card__photos"
          onClick={() =>
            navigate(`/gallery/place/${encodeURIComponent(city.id)}`, {
              state: { fromPath: location.pathname },
            })
          }
          type="button"
        >
          <Images aria-hidden="true" className="city-card__photos-icon" />
          {photoCount}
        </button>
      ) : null}
    </m.li>
  );
}

/**
 * Properties accepted by the CountryFilter component.
 * @property {CountryGroup[]} groups - Every country in the list, with its places
 * @property {string[]} selected - The ids of the countries shown; empty shows all
 * @property {(selected: string[]) => void} onChange - Changes the selection
 */
interface CountryFilterProps {
  groups: CountryGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

/**
 * CountryFilter component
 * A button naming the countries shown; pressing it opens a frosted list to
 * tick any number of them, or all at once.
 * @component
 * @param {CountryFilterProps} props - The filter props
 * @param {CountryGroup[]} props.groups - Every country in the list
 * @param {string[]} props.selected - The ids of the countries shown
 * @param {(selected: string[]) => void} props.onChange - Changes the selection
 * @returns {ReactNode} The country filter
 */
function CountryFilter({
  groups,
  selected,
  onChange,
}: CountryFilterProps): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedIds = new Set(selected);
  const [only] =
    selected.length === 1
      ? groups.filter(({ country }) => country.id === selected[0])
      : [];

  /**
   * Ticks or unticks one country.
   * @param {string} id - The country id
   * @returns {void}
   */
  const toggle = (id: string): void =>
    onChange(
      selected.includes(id)
        ? selected.filter((other) => other !== id)
        : [...selected, id],
    );

  return (
    <>
      <button
        aria-expanded={anchor !== null}
        aria-haspopup="dialog"
        className={classNames(
          "country-filter",
          selected.length > 0 && "country-filter--active",
        )}
        onClick={(event) =>
          setAnchor(anchor ? null : event.currentTarget.getBoundingClientRect())
        }
        ref={triggerRef}
        type="button"
      >
        <ListFilter aria-hidden="true" className="country-filter__icon" />
        <span className="country-filter__label">
          {only ? (
            <>
              <CountryFlag countryId={only.country.id} />
              {only.country.getLocalizedName(currLanguage)}
            </>
          ) : selected.length > 1 ? (
            t("places.countriesSelected", { count: selected.length })
          ) : (
            t("places.allCountries")
          )}
        </span>
        <ChevronDown aria-hidden="true" className="country-filter__chevron" />
      </button>
      <Popover
        anchor={anchor}
        label={t("places.filterCountries")}
        onClose={() => setAnchor(null)}
        placement="below"
        triggerRef={triggerRef}
      >
        <ul className="country-filter__options">
          <li>
            <button
              aria-pressed={selected.length === 0}
              className="country-filter__option country-filter__option--all"
              onClick={() => onChange([])}
              type="button"
            >
              <Checkbox isChecked={selected.length === 0} />
              {t("places.allCountries")}
            </button>
          </li>
          {groups.map(({ country, cities }) => (
            <li key={country.id}>
              <button
                aria-pressed={selectedIds.has(country.id)}
                className="country-filter__option"
                onClick={() => toggle(country.id)}
                type="button"
              >
                <Checkbox isChecked={selectedIds.has(country.id)} />
                <CountryFlag countryId={country.id} />
                <span className="country-filter__name">
                  {country.getLocalizedName(currLanguage)}
                </span>
                <span className="country-filter__count">{cities.length}</span>
              </button>
            </li>
          ))}
        </ul>
      </Popover>
    </>
  );
}

/**
 * PlacesPanel component
 * Every place in one list — visited, lived in, or still to come — grouped by
 * country, with a dropdown to narrow it to some countries. Pressing a place shows it
 * on the map; visited places link to their photos.
 * @component
 * @returns {ReactNode} The places panel
 */
export function PlacesPanel(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { placesFilter } = useAppRoute();
  const { setHoveredCity, setMapPosition } = useMapInteraction();
  const { setIsPanelOpen } = usePanel();
  const { isCompact } = useResponsive();
  const filter = placesFilter ?? "visited";
  const [countryFilter, setCountryFilter] = useState<{
    filter: PlacesFilter;
    ids: string[];
  }>({ filter, ids: [] });
  /* Countries picked under one filter mean nothing under another. */
  const countryIds = countryFilter.filter === filter ? countryFilter.ids : [];
  const shownIds = new Set(countryIds);
  const groups = groupByCountry(CITIES[filter], currLanguage);
  const shown =
    countryIds.length > 0
      ? groups.filter((group) => shownIds.has(group.country.id))
      : groups;

  /**
   * Flies the map to a city and opens its card there; on phones the sheet
   * lowers so the map can be seen.
   * @param {City} city - The city
   * @returns {void}
   */
  const focusCity = (city: City): void => {
    setMapPosition({
      center: city.coordinates,
      zoom: parameters.map.hoveredCityZoom,
    });
    setHoveredCity(city);
    if (isCompact) setIsPanelOpen(false);
  };

  return (
    <PanelFrame
      header={
        <div className="places-panel__top">
          <header className="places-panel__header">
            <h2>{t("places.title")}</h2>
            <p className="places-panel__summary">
              {t("places.summary", {
                cities: CITIES[filter].length,
                countries: groups.length,
              })}
            </p>
          </header>
          <div className="places-panel__filters">
            <SegmentedControl
              id="places-filter"
              label={t("places.title")}
              onChange={(next) =>
                navigate(`/places/${next}`, { replace: true })
              }
              options={(["visited", "lived", "future"] as const).map(
                (value) => ({
                  label: t(`places.${value}`),
                  value,
                }),
              )}
              value={filter}
            />
            {groups.length > 1 ? (
              <CountryFilter
                groups={groups}
                onChange={(ids) => setCountryFilter({ filter, ids })}
                selected={countryIds}
              />
            ) : null}
          </div>
        </div>
      }
    >
      <div className="places-panel__body">
        {shown.length === 0 ? (
          <EmptyState message={t(`places.empty.${filter}`)} />
        ) : (
          shown.map(({ country, cities }) => (
            <section
              className="places-panel__country"
              key={`${filter}-${country.id}`}
            >
              <h3 className="places-panel__country-title">
                <CountryFlag
                  className="places-panel__country-flag"
                  countryId={country.id}
                />
                {country.getLocalizedName(currLanguage)}
                <span className="places-panel__country-count">
                  {cities.length}
                </span>
              </h3>
              <m.ul
                animate="visible"
                className="places-panel__grid"
                initial="hidden"
                variants={staggerList}
              >
                {cities.map((city) => (
                  <CityCard
                    city={city}
                    filter={filter}
                    key={city.id}
                    onFocus={focusCity}
                  />
                ))}
              </m.ul>
            </section>
          ))
        )}
      </div>
    </PanelFrame>
  );
}
