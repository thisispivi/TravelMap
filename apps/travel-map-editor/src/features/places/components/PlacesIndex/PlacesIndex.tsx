import "./PlacesIndex.scss";

import { Button } from "@travelmap/ui/components/Button/Button";
import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { CoverImage } from "@travelmap/ui/components/CoverImage/CoverImage";
import { EmptyState } from "@travelmap/ui/components/EmptyState/EmptyState";
import { PanelFrame } from "@travelmap/ui/components/PanelFrame/PanelFrame";
import { PanelHeader } from "@travelmap/ui/components/PanelHeader/PanelHeader";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { classNames } from "@travelmap/ui/lib/classNames";
import { ChevronRight, MapPinPlus } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router";

import { resolveMediaUrl } from "@/data/dataset";
import { AddPlaceDialog } from "@/shared/components/AddPlaceDialog/AddPlaceDialog";
import { SearchField } from "@/shared/components/SearchField/SearchField";
import { useMapScene } from "@/shared/context/MapScene.context";
import { useDataset } from "@/shared/hooks/useDataset";
import { findWorldCountry } from "@/shared/lib/worldCountries";

import { countTripsByPlace, groupCities } from "../../lib/placeGroups";

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
  const tripCounts = countTripsByPlace(dataset);

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
        <PanelHeader
          action={
            <Button onClick={() => setNewPlaceAt(null)} variant="primary">
              <MapPinPlus aria-hidden="true" />
              {t("places.add")}
            </Button>
          }
          subtitle={t("library.placesCount", {
            cities: dataset.cities.length,
            countries: dataset.countries.length,
          })}
          title={t("common:nav.places")}
        >
          <SearchField
            label={t("library.searchCities")}
            onChange={setQuery}
            value={query}
          />
        </PanelHeader>
      }
    >
      <div className="places-index">
        {groups.length === 0 ? (
          <EmptyState message={t("library.noMatches")} />
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
                          {t("common:tripCount", {
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
