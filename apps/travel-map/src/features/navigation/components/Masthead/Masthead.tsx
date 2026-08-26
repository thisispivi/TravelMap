import "./Masthead.scss";

import { ReactNode } from "react";
import { NavLink } from "react-router";

import LogoIcon from "@/assets/icons/Logo.svg?react";
import { SectionId, useAppRoute } from "@/shared/context/AppRoute.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";

import { DarkModeButton } from "../DarkModeButton/DarkModeButton";
import { LanguageSelector } from "../LanguageSelector/LanguageSelector";

/**
 * Properties accepted by the Masthead component.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} handleDarkModeSwitch - Toggles the active theme
 */
interface MastheadProps {
  isDarkTheme: boolean;
  handleDarkModeSwitch: () => void;
}

/**
 * The two named destinations beside the mark. Journeys and places are two
 * readings of one record rather than two sections, so they share this entry and
 * are switched from inside the record itself.
 * @property {Exclude<SectionId, "atlas">} id - The section the entry opens
 * @property {string} path - The path the entry navigates to
 */
interface MastheadEntry {
  id: Exclude<SectionId, "atlas">;
  path: string;
}

const ENTRIES: MastheadEntry[] = [
  { id: "record", path: "/trips" },
  { id: "figures", path: "/figures" },
];

/**
 * Masthead component
 * The head of the reading margin: the mark, which returns to the arrival, and
 * the two named destinations. It carries no title of its own because the
 * arrival already names the record, and repeating it in every view would cost a
 * line of the column for nothing.
 * @component
 * @param {MastheadProps} props - The masthead props
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {() => void} props.handleDarkModeSwitch - Toggles the active theme
 * @returns {ReactNode} The masthead
 */
export function Masthead({
  isDarkTheme,
  handleDarkModeSwitch,
}: MastheadProps): ReactNode {
  const { section } = useAppRoute();
  const { t } = useLanguage(["home"]);

  return (
    <header className="masthead">
      <NavLink
        aria-label={t("nav.atlas")}
        className={classNames(
          "masthead__mark",
          section === "atlas" && "masthead__mark--active",
        )}
        to="/"
      >
        <LogoIcon aria-hidden className="masthead__mark-icon" />
      </NavLink>

      <nav className="masthead__entries">
        {ENTRIES.map((entry) => (
          <NavLink
            className={classNames(
              "masthead__entry",
              section === entry.id && "masthead__entry--active",
            )}
            key={entry.id}
            to={entry.path}
          >
            {t(`nav.${entry.id}`)}
          </NavLink>
        ))}
      </nav>

      <div className="masthead__tools">
        <LanguageSelector />
        <DarkModeButton
          handleDarkModeSwitch={handleDarkModeSwitch}
          isDarkTheme={isDarkTheme}
        />
      </div>
    </header>
  );
}
