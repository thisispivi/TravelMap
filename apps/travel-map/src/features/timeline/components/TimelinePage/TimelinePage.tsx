import "./TimelinePage.scss";

import { Continent, Trip } from "@travelmap/core";
import { CountryFlag } from "@travelmap/ui/components/CountryFlag/CountryFlag";
import { CoverImage } from "@travelmap/ui/components/CoverImage/CoverImage";
import { PanelFrame } from "@travelmap/ui/components/PanelFrame/PanelFrame";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { formatDateRangeShort } from "@travelmap/ui/i18n/date";
import { classNames } from "@travelmap/ui/lib/classNames";
import { easeOut } from "@travelmap/ui/lib/motion";
import { AnimatePresence, m } from "framer-motion";
import { CSSProperties, ReactNode, useState } from "react";
import { useNavigate } from "react-router";

import { visitedTrips } from "@/data/world";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { PageHeader } from "@/shared/components/PageHeader/PageHeader";
import { YearPills } from "@/shared/components/YearPills/YearPills";
import { useMapInteraction } from "@/shared/context/MapInteraction.context";
import { useResponsive } from "@/shared/hooks/useResponsive";
import { CONTINENT_COLORS } from "@/shared/lib/continentColors";
import { parameters } from "@/shared/lib/parameters";

import { buildTimeline } from "../../lib/timeline";

const years = buildTimeline(visitedTrips);
const HOME_COUNTRY_ID = parameters.homeCity?.country.id;
/* A bar narrower than this share of the year prints its day count beside it. */
const LABEL_MIN_SHARE = 0.035;

/**
 * Picks the continent a trip is about: that of its first country abroad, or
 * of its first country when it never left home.
 * @param {Trip} trip - The trip
 * @returns {Continent} The continent its bar is coloured by
 */
function continentOf(trip: Trip): Continent {
  const countries = trip.getCountriesVisited();
  const abroad = countries.find((country) => country.id !== HOME_COUNTRY_ID);
  return (abroad ?? countries[0])?.continent ?? Continent.EUROPE;
}

/**
 * TimelinePage component
 * One year at a time as a chart drawn to scale: a row per trip with its
 * picture, title and dates on the left, and a bar across the twelve months as
 * long as it lasted, coloured by continent. Chips switch the year; a row opens
 * its trip.
 * @component
 * @returns {ReactNode} The timeline page
 */
export function TimelinePage(): ReactNode {
  const { t, currLanguage } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { setSelectedTrip } = useMapInteraction();
  const [selectedYear, setSelectedYear] = useState(years[0]?.year);
  const current = years.find(({ year }) => year === selectedYear) ?? years[0];
  const { isCompact } = useResponsive();
  /* A phone has no room for month names beside each other; their initials fit. */
  const months = Array.from({ length: 12 }, (_, month) => ({
    label: new Date(2024, month, 1).toLocaleDateString(currLanguage, {
      month: isCompact ? "narrow" : "short",
    }),
    month,
  }));
  const today = new Date();
  const todayShare =
    (today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) /
    (new Date(today.getFullYear() + 1, 0, 1).getTime() -
      new Date(today.getFullYear(), 0, 1).getTime());
  const continents = [...new Set(visitedTrips.map(continentOf))];

  /**
   * Shows a trip's route on the map and opens its itinerary.
   * @param {Trip} trip - The trip
   * @returns {void}
   */
  const openTrip = (trip: Trip): void => {
    setSelectedTrip(trip);
    navigate(`/trip/${encodeURIComponent(trip.id)}`);
  };

  return (
    <PanelFrame
      header={
        <PageHeader
          subtitle={t("timeline.summary", {
            trips: visitedTrips.length,
            years: years.length,
          })}
          title={t("timeline.title")}
        />
      }
    >
      <div className="timeline-page">
        {!current ? (
          <EmptyState message={t("timeline.empty")} />
        ) : (
          <div className="timeline-page__content">
            <YearPills
              id="timeline"
              label={t("timeline.chooseYear")}
              onChange={setSelectedYear}
              value={current.year}
              years={years.map(({ year, entries }) => ({
                count: entries.length,
                year,
              }))}
            />

            <section className="timeline-page__chart">
              <header className="timeline-page__chart-header">
                <h2 className="timeline-page__chart-title">
                  {current.year}
                  <span className="timeline-page__chart-meta">
                    {t("timeline.yearSummary", {
                      count: current.entries.length,
                      days: current.days,
                    })}
                  </span>
                </h2>
              </header>
              <div className="timeline-page__grid">
                <div aria-hidden="true" className="timeline-page__months">
                  {months.map(({ month, label }) => (
                    <span className="timeline-page__month" key={month}>
                      {label}
                    </span>
                  ))}
                </div>
                <AnimatePresence initial={false} mode="popLayout">
                  <m.ol
                    animate={{ opacity: 1 }}
                    className="timeline-page__rows"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    key={current.year}
                    transition={easeOut}
                  >
                    {current.entries.map(({ trip, start, end }, index) => {
                      const days = trip.getDurationInDays();
                      return (
                        <li className="timeline-page__row" key={trip.id}>
                          <button
                            className="timeline-page__row-button"
                            onClick={() => openTrip(trip)}
                            style={
                              {
                                "--bar-color":
                                  CONTINENT_COLORS[continentOf(trip)],
                              } as CSSProperties
                            }
                            type="button"
                          >
                            <span className="timeline-page__trip">
                              <CoverImage
                                className="timeline-page__thumb"
                                src={trip.backgroundImgSource}
                              />
                              <span className="timeline-page__trip-text">
                                <span className="timeline-page__trip-title">
                                  {trip.getLocalizedTitle(currLanguage)}
                                </span>
                                <span className="timeline-page__trip-dates">
                                  {formatDateRangeShort({
                                    eDateInput: trip.eDate,
                                    locale: currLanguage,
                                    sDateInput: trip.sDate,
                                    showYear: false,
                                  })}
                                  {trip.getCountriesVisited().map((country) => (
                                    <CountryFlag
                                      className="timeline-page__flag"
                                      countryId={country.id}
                                      key={country.id}
                                    />
                                  ))}
                                </span>
                              </span>
                            </span>
                            <span className="timeline-page__track">
                              {current.year === today.getFullYear() ? (
                                <span
                                  aria-hidden="true"
                                  className="timeline-page__today"
                                  style={{ left: `${todayShare * 100}%` }}
                                />
                              ) : null}
                              <m.span
                                animate={{ opacity: 1, scaleX: 1 }}
                                className="timeline-page__bar"
                                initial={{ opacity: 0, scaleX: 0 }}
                                style={{
                                  left: `${start * 100}%`,
                                  width: `${(end - start) * 100}%`,
                                }}
                                transition={{
                                  ...easeOut,
                                  delay: index * 0.04,
                                  duration: 0.5,
                                }}
                              >
                                <span
                                  className={classNames(
                                    "timeline-page__bar-label",
                                    end - start < LABEL_MIN_SHARE &&
                                      "timeline-page__bar-label--outside",
                                  )}
                                >
                                  {t("timeline.days", { count: days })}
                                </span>
                              </m.span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </m.ol>
                </AnimatePresence>
              </div>
            </section>

            <ul className="timeline-page__legend">
              {continents.map((continent) => (
                <li
                  className="timeline-page__legend-item"
                  key={continent}
                  style={
                    {
                      "--bar-color": CONTINENT_COLORS[continent],
                    } as CSSProperties
                  }
                >
                  {t(`continents.${continent}`)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PanelFrame>
  );
}
