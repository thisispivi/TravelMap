import "./Library.scss";

import { CountryFlag } from "@app/shared/components/CountryFlag/CountryFlag";
import { PanelFrame } from "@app/shared/components/PanelFrame/PanelFrame";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { CityJson, Issue, TripJson } from "@travelmap/core";
import {
  CheckCircle2,
  CircleAlert,
  Image as ImageIcon,
  Plus,
  Route,
  TriangleAlert,
} from "lucide-react";
import { ReactNode, SyntheticEvent, useState } from "react";
import { Link } from "react-router";

import { resolveMediaUrl } from "../../../../data/dataset";
import { DataFile } from "../../../../data/store";
import { SearchField } from "../../../../shared/components/SearchField/SearchField";
import { useMapScene } from "../../../../shared/context/MapScene.context";
import { datasetIssues, useDataset } from "../../../../shared/hooks/useDataset";
import { findWorldCountry } from "../../../../shared/lib/worldCountries";
import { tripScene, visitedPlacesScene } from "../../../map/lib/tripScene";
import { searchItems } from "../../lib/search";
import {
  groupTripsByYear,
  tripCountryIds,
  tripSearchTerms,
  tripThumbnail,
} from "../../lib/tripCards";
import { NewTripDialog } from "../NewTripDialog/NewTripDialog";

/** Status treatment shown on a trip card. */
type TripStatusTone = "ready" | "warning" | "blocking";

/** Day formatters by locale, built once each rather than on every card render. */
const dayFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Returns the cached day-month-year formatter for a locale.
 * @param {string} locale - The locale
 * @returns {Intl.DateTimeFormat} The formatter
 */
function dayFormatter(locale: string): Intl.DateTimeFormat {
  const cached = dayFormatters.get(locale);
  if (cached) return cached;
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  dayFormatters.set(locale, formatter);
  return formatter;
}

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
      : dayFormatter(locale).format(parsed);
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
 * Properties accepted by the TripCard component.
 * @property {Map<string, CityJson>} cities - The dataset's cities, by id
 * @property {DataFile<TripJson>} file - The trip document
 * @property {Issue[]} issues - Validation issues reported for the trip
 * @property {(trip: TripJson | null) => void} onPreview - Shows the trip on the map, or clears it
 */
interface TripCardProps {
  cities: Map<string, CityJson>;
  file: DataFile<TripJson>;
  issues: Issue[];
  onPreview: (trip: TripJson | null) => void;
}

/**
 * TripCard component
 * One trip as the site draws it: its cover filling the card, the title and
 * dates over a gradient, the countries' flags in one corner and, in the
 * other, whether it is ready to publish or how many problems stand in the
 * way. Pointing at it draws the trip on the map.
 * @component
 * @param {TripCardProps} props - The card props
 * @param {Map<string, CityJson>} props.cities - The dataset's cities
 * @param {DataFile<TripJson>} props.file - The trip document
 * @param {Issue[]} props.issues - Validation issues reported for the trip
 * @param {(trip: TripJson | null) => void} props.onPreview - Shows the trip on the map
 * @returns {ReactNode} The trip card
 */
function TripCard({
  cities,
  file,
  issues,
  onPreview,
}: TripCardProps): ReactNode {
  const { currLanguage, t } = useLanguage(["editor"]);
  const { value } = file;
  const blocking = issues.filter(
    ({ severity }) => severity === "blocking",
  ).length;
  const warnings = issues.filter(
    ({ severity }) => severity === "warning",
  ).length;
  const tone: TripStatusTone =
    blocking > 0 ? "blocking" : warnings > 0 ? "warning" : "ready";
  const imageUrl = resolveMediaUrl(tripThumbnail(value, cities));
  const stays = value.steps.filter((step) => step.type === "stay").length;

  return (
    <li>
      <Link
        className="trip-library-card"
        onBlur={() => onPreview(null)}
        onFocus={() => onPreview(value)}
        onMouseEnter={() => onPreview(value)}
        onMouseLeave={() => onPreview(null)}
        to={`/trip/${encodeURIComponent(value.id)}`}
      >
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
          {tone === "blocking"
            ? t("library.blockingBadge", { count: blocking })
            : tone === "warning"
              ? t("library.warningBadge", { count: warnings })
              : t("library.readyBadge")}
        </span>
        <span className="trip-library-card__flags">
          {tripCountryIds(value, cities)
            .slice(0, 3)
            .map((countryId) => (
              <CountryFlag
                className="trip-library-card__flag"
                countryId={countryId}
                key={countryId}
                src={findWorldCountry(countryId)?.flagUrl}
              />
            ))}
        </span>
        <span className="trip-library-card__caption">
          <span className="trip-library-card__title">
            {value.title || value.id}
          </span>
          <span className="trip-library-card__meta">
            {formatRange(value.sDate, value.eDate, currLanguage) ||
              t("library.noDates")}
            {" · "}
            {t("library.stopCount", { count: stays })}
          </span>
        </span>
      </Link>
    </li>
  );
}

/**
 * Library component
 * The Trips tab: every trip, newest first and grouped by year, as the cards
 * the site shows, with a search and the way to start a new one. Pointing at a
 * card draws that trip on the map; otherwise the map shows every place the
 * trips have slept in.
 * @component
 * @returns {ReactNode} The trips panel
 */
export function Library(): ReactNode {
  const { t } = useLanguage(["editor"]);
  const dataset = useDataset();
  const [isCreating, setIsCreating] = useState(false);
  const [tripQuery, setTripQuery] = useState("");
  const [preview, setPreview] = useState<TripJson | null>(null);
  const issues = datasetIssues(dataset);
  const cities = new Map(dataset.cities.map(({ value }) => [value.id, value]));
  const matchingTrips = searchItems(dataset.trips, tripQuery, ({ value }) =>
    tripSearchTerms(value, cities),
  );
  const tripGroups = groupTripsByYear(matchingTrips);

  useMapScene(
    preview
      ? tripScene(preview, cities)
      : { ...visitedPlacesScene(dataset.trips, cities), frame: [] },
  );

  /**
   * Collects the issues that concern one trip.
   * @param {string} tripId - The trip id
   * @returns {Issue[]} Its issues
   */
  function issuesFor(tripId: string): Issue[] {
    return issues.filter(
      (issue) =>
        (issue.subject.kind === "trip" || issue.subject.kind === "step") &&
        issue.subject.tripId === tripId,
    );
  }

  return (
    <PanelFrame
      header={
        <header className="library__header">
          <div className="library__heading">
            <h2>{t("nav.trips")}</h2>
            <p className="library__summary">
              {t("library.tripCount", { count: matchingTrips.length })}
            </p>
          </div>
          <button
            className="editor-button editor-button--primary"
            onClick={() => setIsCreating(true)}
            type="button"
          >
            <Plus aria-hidden="true" />
            {t("library.newTrip")}
          </button>
          <SearchField
            label={t("library.searchTrips")}
            onChange={setTripQuery}
            value={tripQuery}
          />
        </header>
      }
    >
      <div className="library">
        {tripGroups.length > 0 ? (
          tripGroups.map((group) => (
            <section className="library__year" key={group.year ?? "drafts"}>
              <h3 className="library__year-title">
                {group.year ?? t("library.drafts")}
                <span className="library__year-count">
                  {group.trips.length}
                </span>
              </h3>
              <ul className="library__trips">
                {group.trips.map((trip) => (
                  <TripCard
                    cities={cities}
                    file={trip}
                    issues={issuesFor(trip.value.id)}
                    key={trip.value.id}
                    onPreview={setPreview}
                  />
                ))}
              </ul>
            </section>
          ))
        ) : tripQuery ? (
          <p className="library__no-matches">{t("library.noMatches")}</p>
        ) : (
          <div className="library__welcome">
            <Route aria-hidden="true" />
            <h3>{t("library.welcome")}</h3>
            <p>{t("library.welcomeHint")}</p>
          </div>
        )}
      </div>
      {isCreating ? (
        <NewTripDialog dataset={dataset} onClose={() => setIsCreating(false)} />
      ) : null}
    </PanelFrame>
  );
}
