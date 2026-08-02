import "./Library.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { countBySeverity, Issue } from "@travelmap/core";
import { ReactNode, useState } from "react";
import { Link } from "react-router";

import { datasetIssues, useDataset } from "../../../../shared/hooks/useDataset";
import { findWorldCountry } from "../../../../shared/lib/worldCountries";
import { BackupPanel } from "../../../backup/components/BackupPanel/BackupPanel";
import { NewTripDialog } from "../NewTripDialog/NewTripDialog";

/**
 * Formats a trip's span for a card, tolerating a trip that has no dates yet.
 * @param {string} sDate - Trip start
 * @param {string} eDate - Trip end
 * @returns {string} A compact range
 */
function formatRange(sDate: string, eDate: string): string {
  /**
   * Formats one authored date as a readable day, month, and year.
   * @param {string} value - The authored date
   * @returns {string} The formatted date, or the raw value when unparseable
   */
  const format = (value: string): string => {
    const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);
    return Number.isNaN(parsed.getTime())
      ? value
      : new Intl.DateTimeFormat(undefined, {
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
 * The editor's home. Trips are the only first-class thing here, because a
 * country exists to hold a city and a city exists to be visited: neither is
 * ever the reason someone opens the editor. Places stay reachable for the rare
 * direct edit, one disclosure down.
 * @component
 * @returns {ReactNode} The library screen
 */
export function Library(): ReactNode {
  const { t } = useLanguage(["editor"]);
  const dataset = useDataset();
  const [isCreating, setIsCreating] = useState(false);
  const [arePlacesShown, setArePlacesShown] = useState(false);
  const issues = datasetIssues(dataset);
  const counts = countBySeverity(issues);

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
            {t("library.settings")}
          </Link>
          <button
            className="editor-button editor-button--primary"
            onClick={() => setIsCreating(true)}
            type="button"
          >
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
                      {formatRange(value.sDate, value.eDate)}
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
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          {t("library.health")}
          {counts.blocking > 0 ? (
            <span className="editor__badge">{counts.blocking}</span>
          ) : null}
        </h2>
        {counts.blocking === 0 ? (
          <p className="editor-notice editor-notice--success">
            {t("library.loadsCleanly")}
          </p>
        ) : (
          <ul className="editor-notice editor-notice--error">
            {issues
              .filter((issue) => issue.severity === "blocking")
              .map((issue, index) => (
                <li
                  className="editor-notice__item"
                  key={`${issue.code}-${index}`}
                >
                  {t(`issues.${issue.code}`, {
                    ...issue.params,
                    defaultValue: issue.message,
                  })}{" "}
                  <code>{issue.path}</code>
                </li>
              ))}
          </ul>
        )}
      </section>
      <section className="editor-panel">
        <h2 className="editor-panel__legend">
          <button
            aria-expanded={arePlacesShown}
            className="library__disclosure"
            onClick={() => setArePlacesShown(!arePlacesShown)}
            type="button"
          >
            {t("library.places")}
          </button>
        </h2>
        <p className="editor-panel__hint">
          {t("library.placesCount", {
            cities: dataset.cities.length,
            countries: dataset.countries.length,
          })}
        </p>
        {arePlacesShown ? (
          <ul className="library__places">
            {dataset.countries.map(({ value }) => (
              <li key={value.id}>
                <Link to={`/places/countries/${value.id}`}>
                  {findWorldCountry(value.id)?.flagUrl ? (
                    <img
                      alt=""
                      className="library__flag"
                      src={findWorldCountry(value.id)?.flagUrl}
                    />
                  ) : null}
                  {value.name}
                </Link>
              </li>
            ))}
            {dataset.cities.map(({ value }) => (
              <li key={value.id}>
                <Link to={`/places/cities/${value.id}`}>{value.name}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="editor-panel__hint">{t("library.placesHint")}</p>
        )}
      </section>
      <BackupPanel />
      {isCreating ? (
        <NewTripDialog dataset={dataset} onClose={() => setIsCreating(false)} />
      ) : null}
    </main>
  );
}
