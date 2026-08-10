import "./EditorNav.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import {
  Building2,
  House,
  MapPinned,
  Moon,
  Route,
  Settings,
  Sun,
} from "lucide-react";
import { ReactNode } from "react";
import { Link, useLocation } from "react-router";

/**
 * EditorNav component
 * Keeps the editor's primary destinations visible on wide screens and within
 * thumb reach on small screens.
 * @component
 * @param {EditorNavProps} props
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {() => void} props.onToggleTheme - Switches between editor themes
 * @returns {ReactNode} The persistent editor navigation
 */
export function EditorNav({
  isDarkTheme,
  onToggleTheme,
}: EditorNavProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const { hash, pathname } = useLocation();

  return (
    <nav aria-label={t("nav.primary")} className="editor-nav">
      <Link className="editor-nav__brand" to="/">
        <span aria-hidden="true" className="editor-nav__brand-mark">
          <MapPinned />
        </span>
        <span className="editor-nav__brand-copy">
          <strong>{t("nav.editor")}</strong>
          <small>{t("nav.brandHint")}</small>
        </span>
      </Link>
      <div className="editor-nav__links">
        <Link
          className={classNames(
            "editor-nav__link",
            pathname === "/" && hash === "" ? "editor-nav__link--active" : "",
          )}
          to="/"
        >
          <House aria-hidden="true" />
          <span>{t("nav.home")}</span>
        </Link>
        <Link
          className={classNames(
            "editor-nav__link",
            pathname.startsWith("/trip") || hash === "#trips"
              ? "editor-nav__link--active"
              : "",
          )}
          to="/#trips"
        >
          <Route aria-hidden="true" />
          <span>{t("nav.trips")}</span>
        </Link>
        <Link
          className={classNames(
            "editor-nav__link",
            pathname.startsWith("/places") || hash === "#places"
              ? "editor-nav__link--active"
              : "",
          )}
          to="/#places"
        >
          <MapPinned aria-hidden="true" />
          <span>{t("nav.places")}</span>
        </Link>
        <Link
          className={classNames(
            "editor-nav__link",
            pathname === "/companies" || hash === "#companies"
              ? "editor-nav__link--active"
              : "",
          )}
          to="/companies"
        >
          <Building2 aria-hidden="true" />
          <span>{t("nav.companies")}</span>
        </Link>
        <Link
          className={classNames(
            "editor-nav__link",
            pathname === "/settings" ? "editor-nav__link--active" : "",
          )}
          to="/settings"
        >
          <Settings aria-hidden="true" />
          <span>{t("nav.settings")}</span>
        </Link>
      </div>
      <button
        aria-label={t(isDarkTheme ? "nav.switchToLight" : "nav.switchToDark")}
        className="editor-nav__theme"
        onClick={onToggleTheme}
        type="button"
      >
        {isDarkTheme ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      </button>
    </nav>
  );
}

/**
 * Props for EditorNav.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} onToggleTheme - Switches between editor themes
 */
interface EditorNavProps {
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}
