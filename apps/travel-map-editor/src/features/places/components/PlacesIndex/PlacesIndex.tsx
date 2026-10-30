import "./PlacesIndex.scss";

import { CountryFlag } from "@app/shared/components/CountryFlag/CountryFlag";
import { CoverImage } from "@app/shared/components/CoverImage/CoverImage";
import { PanelFrame } from "@app/shared/components/PanelFrame/PanelFrame";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { CityJson, tripPlaceIds } from "@travelmap/core";
import { ChevronRight, MapPinPlus } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router";

import { resolveMediaUrl } from "../../../../data/dataset";
import { DatasetSnapshot } from "../../../../data/store";
import { SearchField } from "../../../../shared/components/SearchField/SearchField";
import { useMapScene } from "../../../../shared/context/MapScene.context";
import { useDataset } from "../../../../shared/hooks/useDataset";
import { findWorldCountry } from "../../../../shared/lib/worldCountries";
import { searchItems } from "../../../library/lib/search";
import { AddPlaceDialog } from "../AddPlaceDialog/AddPlaceDialog";

/**
 * One country's places, for the list.
 * @property {string} countryId - The country id
 * @property {string} name - The country's name
 * @property {CityJson[]} cities - Its cities, by name
 */
interface CountryGroup {
  countryId: string;
  name: string;
  cities: CityJson[];
}

/**
 * Groups the cities that match the search by country, both by name, so the
 * list reads as the site's Places tab does.
 * @param {DatasetSnapshot} dataset - The dataset
 * @param {string} query - What was typed in the search
 * @returns {CountryGroup[]} The countries with at least one matching city
 */
function groupCities(dataset: DatasetSnapshot, query: string): CountryGroup[] {
  const names = new Map(
    dataset.countries.map(({ value }) => [value.id, value.name]),
  );
  const matching = searchItems(
    dataset.cities.map(({ value }) => value),
    query,
    (city) => [city.name, names.get(city.countryId) ?? city.countryId],
  );
  const groups = new Map<string, CountryGroup>();
  for (const city of matching) {
    const group = groups.get(city.countryId) ?? {
      cities: [],
      countryId: city.countryId,
      name: names.get(city.countryId) ?? city.countryId,
    };
    group.cities.push(city);
    groups.set(city.countryId, group);
  }
  return [...groups.values()]
    .toSorted((first, second) => first.name.localeCompare(second.name))
    .map((group) => ({
      ...group,
      cities: group.cities.toSorted((first, second) =>
        first.name.localeCompare(second.name),
      ),
    }));
}

/**
 * PlacesIndex component
 * The Places tab: every city in the dataset, grouped under its country as the
 * site groups them, each with its picture and how many trips reach it. The
 * map shows them all; pointing at a city lights its pin, and pressing either
 * opens the city's card. New places come from a search or a press on the map.
 * @component
 * @returns {ReactNode} The places panel
 */
export function PlacesIndex(): ReactNode {
  const { t } = useLanguage(["editor"]);
  const dataset = useDataset();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | undefined>();
  const [newPlaceAt, setNewPlaceAt] = useState<
    [number, number] | null | undefined
  >();
  const groups = groupCities(dataset, query);
  const tripCounts = new Map<string, number>();
  for (const { value } of dataset.trips)
    for (const id of new Set(tripPlaceIds(value)))
      tripCounts.set(id, (tripCounts.get(id) ?? 0) + 1);

  useMapScene(
    {
      frame: [],
      pins: groups.flatMap(({ cities }) =>
        cities.map((city) => ({
          coordinates: city.coordinates,
          id: city.id,
          label: city.name,
          tone: "place" as const,
        })),
      ),
      routes: [],
      selectedId: hoveredId,
    },
    {
      onPick: (coordinates) => setNewPlaceAt(coordinates),
      onSelect: (id) =>
        void navigate(`/places/cities/${encodeURIComponent(id)}`),
    },
  );

  return (
    <PanelFrame
      header={
        <header className="places-index__header">
          <div className="places-index__heading">
            <h2>{t("nav.places")}</h2>
            <p className="places-index__summary">
              {t("library.placesCount", {
                cities: dataset.cities.length,
                countries: dataset.countries.length,
              })}
            </p>
          </div>
          <button
            className="editor-button editor-button--primary"
            onClick={() => setNewPlaceAt(null)}
            type="button"
          >
            <MapPinPlus aria-hidden="true" />
            {t("places.add")}
          </button>
          <SearchField
            label={t("library.searchCities")}
            onChange={setQuery}
            value={query}
          />
        </header>
      }
    >
      <div className="places-index">
        {groups.length === 0 ? (
          <p className="places-index__empty">{t("library.noMatches")}</p>
        ) : (
          groups.map(({ countryId, name, cities }) => (
            <section className="places-index__country" key={countryId}>
              <Link
                className="places-index__country-link"
                to={`/places/countries/${encodeURIComponent(countryId)}`}
              >
                <CountryFlag
                  className="places-index__flag"
                  countryId={countryId}
                  src={findWorldCountry(countryId)?.flagUrl}
                />
                {name}
                <span className="places-index__count">{cities.length}</span>
                <ChevronRight
                  aria-hidden="true"
                  className="places-index__chevron"
                />
              </Link>
              <ul className="places-index__cities">
                {cities.map((city) => (
                  <li key={city.id}>
                    <Link
                      className={classNames(
                        "places-index__city",
                        city.id === hoveredId && "places-index__city--hovered",
                      )}
                      onBlur={() => setHoveredId(undefined)}
                      onFocus={() => setHoveredId(city.id)}
                      onMouseEnter={() => setHoveredId(city.id)}
                      onMouseLeave={() => setHoveredId(undefined)}
                      to={`/places/cities/${encodeURIComponent(city.id)}`}
                    >
                      <CoverImage
                        className="places-index__image"
                        src={resolveMediaUrl(city.backgroundImages?.[0])}
                      />
                      <span className="places-index__caption">
                        <span className="places-index__name">{city.name}</span>
                        <span className="places-index__meta">
                          {t("places.tripCount", {
                            count: tripCounts.get(city.id) ?? 0,
                          })}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
      {newPlaceAt !== undefined ? (
        <AddPlaceDialog
          coordinates={newPlaceAt ?? undefined}
          dataset={dataset}
          onClose={() => setNewPlaceAt(undefined)}
          onPlace={(cityId) =>
            void navigate(`/places/cities/${encodeURIComponent(cityId)}`)
          }
          title={t("places.add")}
        />
      ) : null}
    </PanelFrame>
  );
}
