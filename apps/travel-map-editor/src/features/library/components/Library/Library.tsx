import "./Library.scss";

import { CountryFlag } from "@app/shared/components/CountryFlag/CountryFlag";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { CityJson, Issue, TripJson } from "@travelmap/core";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Globe2,
  Image as ImageIcon,
  MapPin,
  MapPinned,
  Plus,
  Route,
  Search,
  Settings,
  TriangleAlert,
} from "lucide-react";
import { ReactNode, SyntheticEvent, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import { resolveLogoUrl, resolveMediaUrl } from "../../../../data/dataset";
import { Company } from "../../../../data/siteConfig";
import { DataFile, DatasetSnapshot } from "../../../../data/store";
import { datasetIssues, useDataset } from "../../../../shared/hooks/useDataset";
import { findWorldCountry } from "../../../../shared/lib/worldCountries";
import { searchItems } from "../../lib/search";
import {
  groupTripsByYear,
  tripCountryIds,
  tripSearchTerms,
  tripThumbnail,
} from "../../lib/tripCards";
import { NewTripDialog } from "../NewTripDialog/NewTripDialog";

/** Maximum number of rows shown on one library page. */
const LIBRARY_PAGE_SIZE = 10;

/**
 * SearchField component
 * The filter control shared by every library collection.
 * @component
 * @param {SearchFieldProps} props
 * @param {boolean} [props.isInset=false] - Whether it sits inside a bordered group
 * @param {string} props.label - Accessible name and placeholder
 * @param {(value: string) => void} props.onChange - Receives the typed query
 * @param {string} props.value - The current query
 * @returns {ReactNode} A labelled search input
 */
function SearchField({
  isInset = false,
  label,
  onChange,
  value,
}: SearchFieldProps): ReactNode {
  return (
    <div
      className={classNames(
        "library__search",
        isInset && "library__search--inset",
      )}
    >
      <Search aria-hidden="true" />
      <input
        aria-label={label}
        className="library__search-input"
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        type="search"
        value={value}
      />
    </div>
  );
}

/**
 * Props for SearchField.
 * @property {boolean} [isInset] - Whether it sits inside a bordered group
 * @property {string} label - Accessible name and placeholder
 * @property {(value: string) => void} onChange - Receives the typed query
 * @property {string} value - The current query
 */
interface SearchFieldProps {
  isInset?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

/** Status treatment shown on a trip card. */
type TripStatusTone = "ready" | "warning" | "blocking";

/**
 * Formats a trip's span, tolerating a draft that has no dates yet.
 * @param {string} sDate - Trip start
 * @param {string} eDate - Trip end
 * @param {string} locale - Locale used for month and day names
 * @returns {string} A compact range
 */
function formatRange(sDate: string, eDate: string, locale: string): string {
  /**
   * Formats one authored date as a readable day, month, and year.
   * @param {string} value - The authored date
   * @returns {string} The formatted date, or the raw value when unparseable
   */
  function format(value: string): string {
    const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
    return Number.isNaN(parsed.getTime())
      ? value
      : new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(parsed);
  }

  if (!sDate && !eDate) return "";
  if (sDate === eDate) return format(sDate);
  return `${format(sDate)} – ${format(eDate)}`;
}

/**
 * Hides a missing thumbnail while preserving the card's illustrated fallback.
 * @param {SyntheticEvent<HTMLImageElement>} event - Failed image event
 * @returns {void}
 */
function handleImageError(event: SyntheticEvent<HTMLImageElement>): void {
  event.currentTarget.hidden = true;
}

/**
 * TripCard component
 * Summarizes a trip with the same country flags and authored imagery used by
 * the public travel map.
 * @component
 * @param {TripCardProps} props
 * @param {Map<string, CityJson>} props.cities - Cities indexed by id
 * @param {DataFile<TripJson>} props.file - Trip source file
 * @param {Issue[]} props.issues - Validation issues belonging to the trip
 * @returns {ReactNode} A linked trip card
 */
function TripCard({ cities, file, issues }: TripCardProps): ReactNode {
  const { currLanguage, t } = useLanguage(["editor"]);
  const { value } = file;
  const blocking = issues.filter(
    (issue) => issue.severity === "blocking",
  ).length;
  const warnings = issues.filter(
    (issue) => issue.severity === "warning",
  ).length;
  const tone: TripStatusTone =
    blocking > 0 ? "blocking" : warnings > 0 ? "warning" : "ready";
  const statusLabel =
    tone === "blocking"
      ? t("library.blockingBadge", { count: blocking })
      : tone === "warning"
        ? t("library.warningBadge", { count: warnings })
        : t("library.readyBadge");
  const imageUrl = resolveMediaUrl(tripThumbnail(value, cities));
  const countryIds = tripCountryIds(value, cities);
  const stops = value.steps.filter((step) => step.type === "stop").length;

  return (
    <Link className="trip-library-card" to={`/trip/${value.id}`}>
      <span className="trip-library-card__media">
        <ImageIcon aria-hidden="true" className="trip-library-card__fallback" />
        {imageUrl ? (
          <img
            alt=""
            className="trip-library-card__image"
            loading="lazy"
            onError={handleImageError}
            src={imageUrl}
          />
        ) : null}
        <span className="trip-library-card__flags">
          {countryIds.length > 0 ? (
            countryIds
              .slice(0, 3)
              .map((countryId) => (
                <CountryFlag
                  className="trip-library-card__flag"
                  countryId={countryId}
                  key={countryId}
                  src={findWorldCountry(countryId)?.flagUrl}
                />
              ))
          ) : (
            <Globe2 aria-hidden="true" />
          )}
        </span>
      </span>
      <span className="trip-library-card__body">
        <span className="trip-library-card__heading">
          <strong>{value.title || value.id}</strong>
          <ArrowUpRight aria-hidden="true" />
        </span>
        <time
          className="trip-library-card__date"
          dateTime={value.sDate || undefined}
        >
          {formatRange(value.sDate, value.eDate, currLanguage) ||
            t("library.noDates")}
        </time>
        <span className="trip-library-card__footer">
          <span>{t("library.stopCount", { count: stops })}</span>
          <span
            className={classNames(
              "trip-library-card__status",
              `trip-library-card__status--${tone}`,
            )}
          >
            {tone === "blocking" ? (
              <CircleAlert aria-hidden="true" />
            ) : tone === "warning" ? (
              <TriangleAlert aria-hidden="true" />
            ) : (
              <CheckCircle2 aria-hidden="true" />
            )}
            {statusLabel}
          </span>
        </span>
      </span>
    </Link>
  );
}

/**
 * Props for TripCard.
 * @property {Map<string, CityJson>} cities - Cities indexed by id
 * @property {DataFile<TripJson>} file - Trip source file
 * @property {Issue[]} issues - Validation issues belonging to the trip
 */
interface TripCardProps {
  cities: Map<string, CityJson>;
  file: DataFile<TripJson>;
  issues: Issue[];
}

/**
 * Pagination component
 * Keeps the compact place collections usable without growing the dashboard
 * indefinitely.
 * @component
 * @param {PaginationProps} props
 * @param {number} props.page - Zero-based current page
 * @param {number} props.pageCount - Total page count
 * @param {(page: number) => void} props.onChange - Selects another page
 * @returns {ReactNode} Previous and next page controls
 */
function Pagination({ page, pageCount, onChange }: PaginationProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <footer className="library__pagination">
      <button
        aria-label={t("library.previousPage")}
        className="library__pagination-button"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <span>{t("library.page", { current: page + 1, total: pageCount })}</span>
      <button
        aria-label={t("library.nextPage")}
        className="library__pagination-button"
        disabled={page === pageCount - 1}
        onClick={() => onChange(page + 1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </footer>
  );
}

/**
 * Props for Pagination.
 * @property {number} page - Zero-based current page
 * @property {number} pageCount - Total page count
 * @property {(page: number) => void} onChange - Selects another page
 */
interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

/**
 * PlacesPanel component
 * Gives countries and cities equal, compact access from the dashboard.
 * @component
 * @param {PlacesPanelProps} props
 * @param {DatasetSnapshot} props.dataset - Current authored dataset
 * @returns {ReactNode} The countries and cities bento panel
 */
function PlacesPanel({ dataset }: PlacesPanelProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [countryPage, setCountryPage] = useState(0);
  const [cityPage, setCityPage] = useState(0);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const countryNames = new Map(
    dataset.countries.map(({ value }) => [value.id, value.name]),
  );
  const countries = searchItems(
    dataset.countries.toSorted((first, second) =>
      first.value.name.localeCompare(second.value.name),
    ),
    countryQuery,
    ({ value }) => [
      value.id,
      value.name,
      ...Object.values(value.nameByLocale ?? {}),
    ],
  );
  const cities = searchItems(
    dataset.cities.toSorted((first, second) =>
      first.value.name.localeCompare(second.value.name),
    ),
    cityQuery,
    ({ value }) => [
      value.id,
      value.name,
      value.countryId,
      countryNames.get(value.countryId) ?? "",
      ...Object.values(value.nameByLocale ?? {}),
    ],
  );
  const countryPageCount = Math.max(
    1,
    Math.ceil(countries.length / LIBRARY_PAGE_SIZE),
  );
  const cityPageCount = Math.max(
    1,
    Math.ceil(cities.length / LIBRARY_PAGE_SIZE),
  );
  const visibleCountryPage = Math.min(countryPage, countryPageCount - 1);
  const visibleCityPage = Math.min(cityPage, cityPageCount - 1);

  return (
    <section className="library__panel library__panel--places" id="places">
      <header className="library__section-header">
        <span aria-hidden="true" className="library__section-icon">
          <MapPinned />
        </span>
        <div>
          <p className="library__section-kicker">{t("library.explore")}</p>
          <h2>{t("library.places")}</h2>
          <p className="library__section-hint">
            {t("library.placesCount", {
              cities: dataset.cities.length,
              countries: dataset.countries.length,
            })}
          </p>
        </div>
      </header>
      <div className="library__place-groups">
        <section className="library__place-group">
          <header className="library__place-group-header">
            <Globe2 aria-hidden="true" />
            <h3>{t("library.countries")}</h3>
            <span>{countries.length}</span>
          </header>
          <SearchField
            isInset
            label={t("library.searchCountries")}
            onChange={setCountryQuery}
            value={countryQuery}
          />
          <ul className="library__places">
            {countries.length === 0 ? (
              <li className="library__places-empty">{t("library.noMatches")}</li>
            ) : null}
            {countries
              .slice(
                visibleCountryPage * LIBRARY_PAGE_SIZE,
                (visibleCountryPage + 1) * LIBRARY_PAGE_SIZE,
              )
              .map(({ value }) => (
                <li key={value.id}>
                  <Link
                    className="library__place-link"
                    to={`/places/countries/${value.id}`}
                  >
                    <span className="library__flag-frame">
                      <CountryFlag
                        className="library__flag"
                        countryId={value.id}
                        src={findWorldCountry(value.id)?.flagUrl}
                      />
                    </span>
                    <span className="library__place-name">{value.name}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
          </ul>
          <Pagination
            onChange={setCountryPage}
            page={visibleCountryPage}
            pageCount={countryPageCount}
          />
        </section>
        <section className="library__place-group">
          <header className="library__place-group-header">
            <MapPin aria-hidden="true" />
            <h3>{t("library.cities")}</h3>
            <span>{cities.length}</span>
          </header>
          <SearchField
            isInset
            label={t("library.searchCities")}
            onChange={setCityQuery}
            value={cityQuery}
          />
          <ul className="library__places">
            {cities.length === 0 ? (
              <li className="library__places-empty">{t("library.noMatches")}</li>
            ) : null}
            {cities
              .slice(
                visibleCityPage * LIBRARY_PAGE_SIZE,
                (visibleCityPage + 1) * LIBRARY_PAGE_SIZE,
              )
              .map(({ value }) => (
                <li key={value.id}>
                  <Link
                    className="library__place-link"
                    to={`/places/cities/${value.id}`}
                  >
                    <span className="library__flag-frame">
                      <CountryFlag
                        className="library__flag"
                        countryId={value.countryId}
                        src={findWorldCountry(value.countryId)?.flagUrl}
                      />
                    </span>
                    <span className="library__place-copy">
                      <span className="library__place-name">{value.name}</span>
                      <span className="library__place-country">
                        {countryNames.get(value.countryId) ?? value.countryId}
                      </span>
                    </span>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
          </ul>
          <Pagination
            onChange={setCityPage}
            page={visibleCityPage}
            pageCount={cityPageCount}
          />
        </section>
      </div>
    </section>
  );
}

/**
 * Props for PlacesPanel.
 * @property {DatasetSnapshot} dataset - Current authored dataset
 */
interface PlacesPanelProps {
  dataset: DatasetSnapshot;
}

/**
 * CompaniesPanel component
 * Shows the available operator catalogue and links to its dedicated editor.
 * @component
 * @param {CompaniesPanelProps} props
 * @param {Record<string, Company>} props.companies - Authored operators
 * @returns {ReactNode} The transport-company bento panel
 */
function CompaniesPanel({ companies }: CompaniesPanelProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const [page, setPage] = useState(0);
  const entries = Object.entries(companies).toSorted((first, second) =>
    first[1].name.localeCompare(second[1].name),
  );
  const pageCount = Math.max(1, Math.ceil(entries.length / LIBRARY_PAGE_SIZE));
  const visiblePage = Math.min(page, pageCount - 1);

  return (
    <section
      className="library__panel library__panel--companies"
      id="companies"
    >
      <header className="library__section-header">
        <span aria-hidden="true" className="library__section-icon">
          <Building2 />
        </span>
        <div>
          <p className="library__section-kicker">{t("library.operators")}</p>
          <h2>{t("companyEditor.title")}</h2>
          <p className="library__section-hint">
            {t("library.companyCount", { count: entries.length })}
          </p>
        </div>
      </header>
      {entries.length > 0 ? (
        <ul className="library__companies">
          {entries
            .slice(
              visiblePage * LIBRARY_PAGE_SIZE,
              (visiblePage + 1) * LIBRARY_PAGE_SIZE,
            )
            .map(([id, company]) => {
            const logo = resolveLogoUrl(company.logo);
            return (
              <li className="library__company" key={id}>
                <span className="library__company-logo">
                  {logo ? (
                    <img alt="" onError={handleImageError} src={logo} />
                  ) : (
                    <Building2 aria-hidden="true" />
                  )}
                </span>
                <span className="library__company-copy">
                  <strong>{company.name}</strong>
                  <code>{id}</code>
                  </span>
                </li>
              );
            })}
        </ul>
      ) : (
        <p className="library__companies-empty">
          <Building2 aria-hidden="true" />
          {t("companyEditor.empty")}
        </p>
      )}
      <Pagination onChange={setPage} page={visiblePage} pageCount={pageCount} />
      <Link
        className="editor-button editor-button--primary library__manage-link"
        to="/companies"
      >
        {t("companyEditor.manage")}
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </section>
  );
}

/**
 * Props for CompaniesPanel.
 * @property {Record<string, Company>} companies - Authored operators
 */
interface CompaniesPanelProps {
  companies: Record<string, Company>;
}

/**
 * Library component
 * The editor home is a bento dashboard: the trip archive remains dominant,
 * with supporting place and operator libraries alongside it.
 * @component
 * @returns {ReactNode} The editor dashboard
 */
export function Library(): ReactNode {
  const { t } = useLanguage(["editor"]);
  const { hash } = useLocation();
  const dataset = useDataset();
  const [isCreating, setIsCreating] = useState(false);
  const [tripQuery, setTripQuery] = useState("");
  const issues = datasetIssues(dataset);
  const cities = new Map(dataset.cities.map(({ value }) => [value.id, value]));
  const matchingTrips = searchItems(dataset.trips, tripQuery, ({ value }) =>
    tripSearchTerms(value, cities),
  );
  const tripGroups = groupTripsByYear(matchingTrips);

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [hash]);

  /**
   * Returns validation issues attached to one trip.
   * @param {string} tripId - Trip identifier
   * @returns {Issue[]} Matching trip and itinerary issues
   */
  function issuesFor(tripId: string): Issue[] {
    return issues.filter(
      (issue) =>
        (issue.subject.kind === "trip" || issue.subject.kind === "step") &&
        issue.subject.tripId === tripId,
    );
  }

  return (
    <main className="library">
      <header className="library__hero">
        <div>
          <p className="editor__eyebrow">{t("library.eyebrow")}</p>
          <h1>{t("library.title")}</h1>
          <p className="library__hero-copy">{t("library.subtitle")}</p>
        </div>
        <div className="library__header-actions">
          <Link className="editor-button" to="/settings">
            <Settings aria-hidden="true" />
            {t("library.settings")}
          </Link>
          <button
            className="editor-button editor-button--primary"
            onClick={() => setIsCreating(true)}
            type="button"
          >
            <Plus aria-hidden="true" />
            {t("library.newTrip")}
          </button>
        </div>
      </header>
      <div className="library__bento">
        <section className="library__panel library__panel--trips" id="trips">
          <header className="library__section-header library__section-header--trips">
            <span aria-hidden="true" className="library__section-icon">
              <Route />
            </span>
            <div>
              <p className="library__section-kicker">{t("library.archive")}</p>
              <h2>{t("library.allTrips")}</h2>
              <p className="library__section-hint">
                {t("library.tripCount", { count: matchingTrips.length })}
              </p>
            </div>
            <button
              className="editor-button editor-button--primary library__section-action"
              onClick={() => setIsCreating(true)}
              type="button"
            >
              <Plus aria-hidden="true" />
              {t("library.newTrip")}
            </button>
          </header>
          <SearchField
            label={t("library.searchTrips")}
            onChange={setTripQuery}
            value={tripQuery}
          />
          {tripGroups.length > 0 ? (
            <div className="library__years">
              {tripGroups.map((group) => (
                <section className="library__year" key={group.year ?? "drafts"}>
                  <header className="library__year-header">
                    <h3>{group.year ?? t("library.drafts")}</h3>
                    <span>{group.trips.length}</span>
                  </header>
                  <div className="library__trips">
                    {group.trips.map((trip) => (
                      <TripCard
                        cities={cities}
                        file={trip}
                        issues={issuesFor(trip.value.id)}
                        key={trip.value.id}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : tripQuery ? (
            <p className="library__no-matches">{t("library.noMatches")}</p>
          ) : (
            <div className="library__welcome">
              <Route aria-hidden="true" />
              <h3>{t("library.welcome")}</h3>
              <p>{t("library.welcomeHint")}</p>
              <button
                className="editor-button editor-button--primary"
                onClick={() => setIsCreating(true)}
                type="button"
              >
                <Plus aria-hidden="true" />
                {t("library.newTrip")}
              </button>
            </div>
          )}
        </section>
        <PlacesPanel dataset={dataset} />
        <CompaniesPanel companies={dataset.config.value.companies ?? {}} />
      </div>
      {isCreating ? (
        <NewTripDialog dataset={dataset} onClose={() => setIsCreating(false)} />
      ) : null}
    </main>
  );
}
