import "./Nav.scss";

import CityIcon from "@app/assets/icons/City.svg?react";
import GlobeIcon from "@app/assets/icons/Globe.svg?react";
import LogoIcon from "@app/assets/icons/Logo.svg?react";
import MapIcon from "@app/assets/icons/Map.svg?react";
import MoonFilledIcon from "@app/assets/icons/MoonFilled.svg?react";
import SunFilledIcon from "@app/assets/icons/SunFilled.svg?react";
import { useLanguage } from "@app/hooks/language/language";
import { classNames } from "@app/utils/className";
import Fuse from "fuse.js";
import { ReactNode, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router";

import { cities, countries, trips } from "../../../core/dataset";
import { findWorldCountry } from "../../../core/world";

/**
 * One navigable document in the sidebar.
 * @property {string} country - Owning country id, empty when not applicable
 * @property {string} [flagUrl] - Flag shown beside the entry
 * @property {string} id - Document identifier
 * @property {string} kind - Which list the entry belongs to
 * @property {string} label - Display text
 * @property {string} to - Route for the entry
 */
interface NavEntry {
  country: string;
  flagUrl?: string;
  id: string;
  kind: "country" | "city" | "trip";
  label: string;
  to: string;
}

const FUSE_OPTIONS = {
  ignoreLocation: true,
  keys: [
    { name: "label", weight: 3 },
    { name: "country", weight: 1 },
    { name: "id", weight: 1 },
  ],
  threshold: 0.4,
};

/**
 * Builds every navigable entry once, resolving flags from the world catalogue.
 * @returns {NavEntry[]} All sidebar entries
 */
function buildEntries(): NavEntry[] {
  const countryEntries: NavEntry[] = countries.map(({ value }) => ({
    country: value.id,
    flagUrl: findWorldCountry(value.id)?.flagUrl,
    id: value.id,
    kind: "country",
    label: value.name,
    to: `/countries/${value.id}`,
  }));
  const cityEntries: NavEntry[] = cities.map(({ value }) => ({
    country: value.countryId,
    flagUrl: findWorldCountry(value.countryId)?.flagUrl,
    id: value.id,
    kind: "city",
    label: value.name,
    to: `/cities/${value.id}`,
  }));
  // Newest first: recent trips are the ones being edited.
  const tripEntries: NavEntry[] = trips
    .toSorted((first, second) =>
      second.value.sDate.localeCompare(first.value.sDate),
    )
    .map(({ value }) => ({
      country: "",
      id: value.id,
      kind: "trip" as const,
      label: value.title,
      to: `/trips/${value.id}`,
    }));

  return [...countryEntries, ...cityEntries, ...tripEntries];
}

/**
 * EntryLink component
 * One document link, with its flag and an optional trailing hint.
 * @component
 * @param {EntryLinkProps} props
 * @param {NavEntry} props.entry - The entry to render
 * @param {string} [props.hint] - Trailing text such as the entry kind
 * @returns {ReactNode} The navigation link
 */
function EntryLink({ entry, hint }: EntryLinkProps): ReactNode {
  return (
    <NavLink
      className={({ isActive }) =>
        classNames("editor-nav__link", isActive && "editor-nav__link--active")
      }
      to={entry.to}
    >
      {entry.flagUrl ? (
        <img alt="" className="editor-nav__flag" src={entry.flagUrl} />
      ) : (
        <span className="editor-nav__flag editor-nav__flag--none" />
      )}
      <span className="editor-nav__label">{entry.label}</span>
      {hint ? <span className="editor-nav__hint">{hint}</span> : null}
    </NavLink>
  );
}

/**
 * Props for EntryLink.
 * @property {NavEntry} entry - The entry to render
 * @property {string} [hint] - Trailing text such as the entry kind
 */
interface EntryLinkProps {
  entry: NavEntry;
  hint?: string;
}

/**
 * Nav component
 * The editor sidebar. A fuzzy search spans every document so a large dataset
 * is reachable in a few keystrokes, and the browsable lists below it collapse
 * by kind — with cities nested under their country — so the sidebar length
 * stays bounded no matter how much data a fork holds.
 * @component
 * @param {NavProps} props
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {() => void} props.onToggleTheme - Toggles the active theme
 * @param {number} props.problemCount - Number of dataset errors to flag
 * @returns {ReactNode} The editor sidebar
 */
export function Nav({
  isDarkTheme,
  onToggleTheme,
  problemCount,
}: NavProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const entries = useMemo(() => buildEntries(), []);
  const fuse = useMemo(() => new Fuse(entries, FUSE_OPTIONS), [entries]);
  const [term, setTerm] = useState("");
  const { pathname } = useLocation();
  const [openKind, setOpenKind] = useState<NavEntry["kind"] | null>(() =>
    pathname.startsWith("/cities")
      ? "city"
      : pathname.startsWith("/trips")
        ? "trip"
        : pathname.startsWith("/countries")
          ? "country"
          : null,
  );
  const [openCountry, setOpenCountry] = useState<string | null>(null);
  const results = term.trim()
    ? fuse.search(term, { limit: 40 }).map((result) => result.item)
    : [];
  const sections = [
    {
      icon: GlobeIcon,
      items: entries.filter((entry) => entry.kind === "country"),
      kind: "country" as const,
      title: t("nav.countries"),
    },
    {
      icon: CityIcon,
      items: entries.filter((entry) => entry.kind === "city"),
      kind: "city" as const,
      title: t("nav.cities"),
    },
    {
      icon: MapIcon,
      items: entries.filter((entry) => entry.kind === "trip"),
      kind: "trip" as const,
      title: t("nav.trips"),
    },
  ];
  return (
    <nav className="editor-nav">
      <div className="editor-nav__brand">
        <LogoIcon aria-hidden="true" className="editor-nav__logo" />
        <span className="editor-nav__title">{t("nav.editor")}</span>
        <button
          aria-label={
            isDarkTheme ? t("nav.switchToLight") : t("nav.switchToDark")
          }
          className="editor-nav__theme"
          onClick={onToggleTheme}
          type="button"
        >
          {isDarkTheme ? (
            <SunFilledIcon aria-hidden="true" />
          ) : (
            <MoonFilledIcon aria-hidden="true" />
          )}
        </button>
      </div>
      <label className="editor-nav__search">
        <span className="editor-nav__search-label">{t("nav.search")}</span>
        <input
          className="editor-field__control editor-nav__search-input"
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t("nav.searchPlaceholder")}
          type="search"
          value={term}
        />
      </label>
      {term.trim() ? (
        <div className="editor-nav__results">
          {results.length > 0 ? (
            results.map((entry) => (
              <EntryLink
                entry={entry}
                hint={t(`nav.kind.${entry.kind}`)}
                key={`${entry.kind}-${entry.id}`}
              />
            ))
          ) : (
            <p className="editor-nav__empty">{t("nav.noMatches")}</p>
          )}
        </div>
      ) : (
        <>
          <NavLink className="editor-nav__link" end to="/">
            <span className="editor-nav__label">{t("nav.overview")}</span>
            {problemCount > 0 ? (
              <span className="editor-nav__count editor-nav__count--error">
                {problemCount}
              </span>
            ) : null}
          </NavLink>
          <NavLink className="editor-nav__link" to="/config">
            <span className="editor-nav__label">{t("nav.configuration")}</span>
          </NavLink>
          <div className="editor-nav__sections">
            {sections.map((section) => {
              const isOpen = openKind === section.kind;
              return (
                <section className="editor-nav__section" key={section.kind}>
                  <h2 className="editor-nav__heading">
                    <button
                      aria-expanded={isOpen}
                      className="editor-nav__disclosure"
                      onClick={() => setOpenKind(isOpen ? null : section.kind)}
                      type="button"
                    >
                      <span
                        className={classNames(
                          "editor-nav__chevron",
                          isOpen && "editor-nav__chevron--open",
                        )}
                      >
                        ▸
                      </span>
                      <section.icon aria-hidden="true" />
                      {section.title}
                      <span className="editor-nav__count">
                        {section.items.length}
                      </span>
                    </button>
                    {section.kind === "country" ? null : (
                      <NavLink
                        aria-label={t(`nav.newKind.${section.kind}`)}
                        className="editor-nav__add"
                        to={`/new/${section.kind}`}
                      >
                        +
                      </NavLink>
                    )}
                  </h2>
                  {isOpen && section.kind === "city" ? (
                    <CityTree
                      cities={section.items}
                      onToggleCountry={(id) =>
                        setOpenCountry(openCountry === id ? null : id)
                      }
                      openCountry={openCountry}
                    />
                  ) : null}
                  {isOpen && section.kind !== "city"
                    ? section.items.map((entry) => (
                        <EntryLink entry={entry} key={entry.id} />
                      ))
                    : null}
                  {isOpen && section.items.length === 0 ? (
                    <p className="editor-nav__empty">
                      {t("nav.nothingHereYet")}
                    </p>
                  ) : null}
                </section>
              );
            })}
          </div>
        </>
      )}
    </nav>
  );
}

/**
 * CityTree component
 * Groups cities under their country so the longest list in the sidebar stays
 * one screen tall.
 * @component
 * @param {CityTreeProps} props
 * @param {NavEntry[]} props.cities - Every city entry
 * @param {(countryId: string) => void} props.onToggleCountry - Expands or collapses a country
 * @param {string | null} props.openCountry - The expanded country, if any
 * @returns {ReactNode} The grouped city list
 */
function CityTree({
  cities: cityEntries,
  onToggleCountry,
  openCountry,
}: CityTreeProps): ReactNode {
  const grouped = new Map<string, NavEntry[]>();
  for (const entry of cityEntries) {
    const group = grouped.get(entry.country) ?? [];
    group.push(entry);
    grouped.set(entry.country, group);
  }
  return (
    <>
      {[...grouped.entries()]
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([countryId, group]) => {
          const isOpen = openCountry === countryId;
          return (
            <div className="editor-nav__group" key={countryId}>
              <button
                aria-expanded={isOpen}
                className="editor-nav__group-header"
                onClick={() => onToggleCountry(countryId)}
                type="button"
              >
                <span
                  className={classNames(
                    "editor-nav__chevron",
                    isOpen && "editor-nav__chevron--open",
                  )}
                >
                  ▸
                </span>
                {group[0]?.flagUrl ? (
                  <img
                    alt=""
                    className="editor-nav__flag"
                    src={group[0].flagUrl}
                  />
                ) : (
                  <span className="editor-nav__flag editor-nav__flag--none" />
                )}
                <span className="editor-nav__label">{countryId}</span>
                <span className="editor-nav__count">{group.length}</span>
              </button>
              {isOpen
                ? group.map((entry) => (
                    <EntryLink entry={entry} key={entry.id} />
                  ))
                : null}
            </div>
          );
        })}
    </>
  );
}

/**
 * Props for CityTree.
 * @property {NavEntry[]} cities - Every city entry
 * @property {(countryId: string) => void} onToggleCountry - Expands or collapses a country
 * @property {string | null} openCountry - The expanded country, if any
 */
interface CityTreeProps {
  cities: NavEntry[];
  onToggleCountry: (countryId: string) => void;
  openCountry: string | null;
}

/**
 * Props for Nav.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} onToggleTheme - Toggles the active theme
 * @property {number} problemCount - Number of dataset errors to flag
 */
interface NavProps {
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  problemCount: number;
}
