import "./Library.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { Issue } from "@travelmap/core";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Globe2,
  MapPin,
  MapPinned,
  Plus,
  Settings,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Link } from "react-router";

import { datasetIssues, useDataset } from "../../../../shared/hooks/useDataset";
import { findWorldCountry } from "../../../../shared/lib/worldCountries";
import { NewTripDialog } from "../NewTripDialog/NewTripDialog";
import { TransportCompanies } from "../TransportCompanies/TransportCompanies";

/** Maximum number of countries or cities shown on one library page. */
const PLACE_PAGE_SIZE = 8;

/**
 * Formats a trip's span for a card, tolerating a trip that has no dates yet.
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
  const format = (value: string): string => {
    const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
    return Number.isNaN(parsed.getTime())
      ? value
      : new Intl.DateTimeFormat(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(parsed);
  };
  if (!sDate && !eDate) return "";
  if (sDate === eDate) return format(sDate);
  return `${format(sDate)} – ${format(eDate)}`;
}

/**
 * Library component
 * The editor's home, with trips first and compact access to supporting places
 * and transport-company configuration.
 * @component
 * @returns {ReactNode} The library screen
 */
export function Library(): ReactNode {
  const { currLanguage, t } = useLanguage(["editor"]);
  const dataset = useDataset();
  const [isCreating, setIsCreating] = useState(false);
  const [countryPage, setCountryPage] = useState(0);
  const [cityPage, setCityPage] = useState(0);
  const issues = datasetIssues(dataset);
  const countries = dataset.countries.toSorted((first, second) =>
    first.value.name.localeCompare(second.value.name),
  );
  const cities = dataset.cities.toSorted((first, second) =>
    first.value.name.localeCompare(second.value.name),
  );
  const countryNames = new Map(
    dataset.countries.map(({ value }) => [value.id, value.name]),
  );
  const countryPageCount = Math.max(
    1,
    Math.ceil(countries.length / PLACE_PAGE_SIZE),
  );
  const cityPageCount = Math.max(1, Math.ceil(cities.length / PLACE_PAGE_SIZE));
  const visibleCountryPage = Math.min(countryPage, countryPageCount - 1);
  const visibleCityPage = Math.min(cityPage, cityPageCount - 1);

  /**
   * Counts the problems attached to one trip, for its card badge.
   * @param {string} tripId - The trip identifier
   * @returns {Issue[]} Issues about that trip
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
      <header className="library__header">
        <div>
          <p className="editor__eyebrow">{t("library.eyebrow")}</p>
          <h1>{t("library.title")}</h1>
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
      {dataset.trips.length === 0 ? (
        <section className="editor-panel">
          <h2 className="editor-panel__legend">{t("library.welcome")}</h2>
          <p className="editor-panel__hint">{t("library.welcomeHint")}</p>
          <ol className="library__steps">
            <li>{t("library.step1")}</li>
            <li>{t("library.step2")}</li>
            <li>{t("library.step3")}</li>
          </ol>
          <button
            className="editor-button editor-button--primary"
            onClick={() => setIsCreating(true)}
            type="button"
          >
            <Plus aria-hidden="true" />
            {t("library.newTrip")}
          </button>
        </section>
      ) : (
        <ul className="library__trips">
          {dataset.trips
            .toSorted((first, second) =>
              second.value.sDate.localeCompare(first.value.sDate),
            )
            .map(({ value }) => {
              const tripIssues = issuesFor(value.id);
              const blocking = tripIssues.filter(
                (issue) => issue.severity === "blocking",
              ).length;
              return (
                <li key={value.id}>
                  <Link className="library__trip" to={`/trip/${value.id}`}>
                    <span className="library__trip-title">
                      {value.title || value.id}
                    </span>
                    <span className="library__trip-meta">
                      {formatRange(value.sDate, value.eDate, currLanguage)}
                    </span>
                    <span className="library__trip-meta">
                      {t("library.stopCount", {
                        count: value.steps.filter(
                          (step) => step.type === "stop",
                        ).length,
                      })}
                    </span>
                    <span
                      className={
                        blocking > 0
                          ? "library__trip-badge library__trip-badge--blocking"
                          : "library__trip-badge"
                      }
                    >
                      {blocking > 0
                        ? t("library.blockingBadge", { count: blocking })
                        : t("library.readyBadge")}
                    </span>
                  </Link>
                </li>
              );
            })}
        </ul>
      )}
      <section className="editor-panel library__places-panel">
        <header className="library__section-header">
          <span aria-hidden="true" className="library__section-icon">
            <MapPinned />
          </span>
          <div>
            <h2 className="editor-panel__legend">{t("library.places")}</h2>
            <p className="editor-panel__hint">
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
              <span>{dataset.countries.length}</span>
            </header>
            <ul className="library__places">
              {countries
                .slice(
                  visibleCountryPage * PLACE_PAGE_SIZE,
                  (visibleCountryPage + 1) * PLACE_PAGE_SIZE,
                )
                .map(({ value }) => {
                  const flagUrl = findWorldCountry(value.id)?.flagUrl;
                  return (
                    <li key={value.id}>
                      <Link
                        className="library__place-link"
                        to={`/places/countries/${value.id}`}
                      >
                        <span className="library__flag-frame">
                          {flagUrl ? (
                            <img
                              alt=""
                              className="library__flag"
                              src={flagUrl}
                            />
                          ) : (
                            <Globe2 aria-hidden="true" />
                          )}
                        </span>
                        <span className="library__place-name">
                          {value.name}
                        </span>
                        <ArrowUpRight aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
            </ul>
            <footer className="library__pagination">
              <button
                aria-label={t("library.previousPage")}
                className="library__pagination-button"
                disabled={visibleCountryPage === 0}
                onClick={() => setCountryPage(visibleCountryPage - 1)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <span>
                {t("library.page", {
                  current: visibleCountryPage + 1,
                  total: countryPageCount,
                })}
              </span>
              <button
                aria-label={t("library.nextPage")}
                className="library__pagination-button"
                disabled={visibleCountryPage === countryPageCount - 1}
                onClick={() => setCountryPage(visibleCountryPage + 1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </footer>
          </section>
          <section className="library__place-group">
            <header className="library__place-group-header">
              <MapPin aria-hidden="true" />
              <h3>{t("library.cities")}</h3>
              <span>{dataset.cities.length}</span>
            </header>
            <ul className="library__places">
              {cities
                .slice(
                  visibleCityPage * PLACE_PAGE_SIZE,
                  (visibleCityPage + 1) * PLACE_PAGE_SIZE,
                )
                .map(({ value }) => {
                  const flagUrl = findWorldCountry(value.countryId)?.flagUrl;
                  return (
                    <li key={value.id}>
                      <Link
                        className="library__place-link"
                        to={`/places/cities/${value.id}`}
                      >
                        <span className="library__flag-frame">
                          {flagUrl ? (
                            <img
                              alt=""
                              className="library__flag"
                              src={flagUrl}
                            />
                          ) : (
                            <MapPin aria-hidden="true" />
                          )}
                        </span>
                        <span className="library__place-copy">
                          <span className="library__place-name">
                            {value.name}
                          </span>
                          <span className="library__place-country">
                            {countryNames.get(value.countryId) ??
                              value.countryId}
                          </span>
                        </span>
                        <ArrowUpRight aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
            </ul>
            <footer className="library__pagination">
              <button
                aria-label={t("library.previousPage")}
                className="library__pagination-button"
                disabled={visibleCityPage === 0}
                onClick={() => setCityPage(visibleCityPage - 1)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <span>
                {t("library.page", {
                  current: visibleCityPage + 1,
                  total: cityPageCount,
                })}
              </span>
              <button
                aria-label={t("library.nextPage")}
                className="library__pagination-button"
                disabled={visibleCityPage === cityPageCount - 1}
                onClick={() => setCityPage(visibleCityPage + 1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </footer>
          </section>
        </div>
      </section>
      <TransportCompanies file={dataset.config} />
      {isCreating ? (
        <NewTripDialog dataset={dataset} onClose={() => setIsCreating(false)} />
      ) : null}
    </main>
  );
}
