import "./Nav.scss";

import CityIcon from "@app/assets/icons/City.svg?react";
import GlobeIcon from "@app/assets/icons/Globe.svg?react";
import LogoIcon from "@app/assets/icons/Logo.svg?react";
import MapIcon from "@app/assets/icons/Map.svg?react";
import MoonFilledIcon from "@app/assets/icons/MoonFilled.svg?react";
import SunFilledIcon from "@app/assets/icons/SunFilled.svg?react";
import { classNames } from "@app/utils/className";
import { ComponentType, ReactNode, SVGProps, useState } from "react";
import { NavLink } from "react-router";

import { cities, countries, trips } from "../../dataset";

/**
 * One sidebar group listing documents of a single kind.
 * @property {ComponentType<SVGProps<SVGSVGElement>>} icon - Section icon
 * @property {{ id: string; label: string; hint?: string }[]} items - Visible documents
 * @property {string} kind - Create-route segment for the section
 * @property {string} route - Route prefix for the section's documents
 * @property {string} title - Section heading
 */
interface NavSection {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  items: { id: string; label: string; hint?: string }[];
  kind: string;
  route: string;
  title: string;
}

/**
 * Nav component
 * The editor sidebar: brand, theme switch, a filter across every document, and
 * one group per document kind with an inline create action.
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
  const [filter, setFilter] = useState("");
  const term = filter.trim().toLowerCase();

  /**
   * Reports whether an entry should stay visible under the current filter.
   * @param {string[]} haystack - Searchable text for the entry
   * @returns {boolean} Whether the entry matches
   */
  function matches(haystack: string[]): boolean {
    return (
      term === "" || haystack.some((text) => text.toLowerCase().includes(term))
    );
  }

  const sections: NavSection[] = [
    {
      icon: GlobeIcon,
      items: countries
        .filter(({ value }) => matches([value.id, value.name]))
        .map(({ value }) => ({ id: value.id, label: value.name })),
      kind: "country",
      route: "/countries",
      title: "Countries",
    },
    {
      icon: CityIcon,
      items: cities
        .filter(({ value }) => matches([value.id, value.name, value.countryId]))
        .map(({ value }) => ({
          hint: value.countryId,
          id: value.id,
          label: value.name,
        })),
      kind: "city",
      route: "/cities",
      title: "Cities",
    },
    {
      icon: MapIcon,
      items: trips
        .filter(({ value }) => matches([value.id, value.title]))
        .map(({ value }) => ({ id: value.id, label: value.title })),
      kind: "trip",
      route: "/trips",
      title: "Trips",
    },
  ];
  return (
    <nav className="editor-nav">
      <div className="editor-nav__brand">
        <LogoIcon aria-hidden="true" className="editor-nav__logo" />
        <span className="editor-nav__title">Editor</span>
        <button
          aria-label={
            isDarkTheme ? "Switch to light mode" : "Switch to dark mode"
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
      <NavLink className="editor-nav__link" end to="/">
        Overview
        {problemCount > 0 ? (
          <span className="editor-nav__count editor-nav__count--error">
            {problemCount}
          </span>
        ) : null}
      </NavLink>
      <NavLink className="editor-nav__link" to="/config">
        Configuration
      </NavLink>
      <label className="editor-nav__filter">
        <span className="editor-nav__filter-label">Filter</span>
        <input
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Search everything"
          type="search"
          value={filter}
        />
      </label>
      <div className="editor-nav__sections">
        {sections.map((section) => (
          <section className="editor-nav__section" key={section.route}>
            <h2 className="editor-nav__heading">
              <section.icon aria-hidden="true" />
              {section.title}
              <span className="editor-nav__count">{section.items.length}</span>
              <NavLink
                aria-label={`New ${section.kind}`}
                className="editor-nav__add"
                to={`/new/${section.kind}`}
              >
                +
              </NavLink>
            </h2>
            {section.items.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  classNames(
                    "editor-nav__link",
                    "editor-nav__link--item",
                    isActive && "editor-nav__link--active",
                  )
                }
                key={item.id}
                to={`${section.route}/${item.id}`}
              >
                <span className="editor-nav__label">{item.label}</span>
                {item.hint ? (
                  <span className="editor-nav__hint">{item.hint}</span>
                ) : null}
              </NavLink>
            ))}
            {section.items.length === 0 ? (
              <p className="editor-nav__empty">Nothing here yet.</p>
            ) : null}
          </section>
        ))}
      </div>
    </nav>
  );
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
