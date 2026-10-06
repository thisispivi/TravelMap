import "./EditorNav.scss";

import LogoIcon from "@app/assets/icons/Logo.svg?react";
import { SUPPORTED_LOCALES } from "@app/i18n/locale";
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

import { useSaveStatus } from "../../context/SaveStatus.context";
import { SaveChip } from "../SaveChip/SaveChip";

const NAV_TABS = [
  { icon: House, id: "home", to: "/" },
  { icon: Route, id: "trips", to: "/#trips" },
  { icon: MapPinned, id: "places", to: "/#places" },
  { icon: Building2, id: "companies", to: "/companies" },
  { icon: Settings, id: "settings", to: "/settings" },
] as const;
const LANGUAGE_LABEL_KEYS = {
  "en-US": "english",
  "it-IT": "italian",
} as const;

/** The primary destination a URL belongs to. */
type NavTabId = (typeof NAV_TABS)[number]["id"];

/**
 * Decides which destination the current URL belongs to. The dashboard keeps
 * trips, places, and operators on one route, so below it the hash is what
 * separates them from the dashboard as a whole.
 * @param {string} pathname - The current path
 * @param {string} hash - The current hash, including its leading "#"
 * @returns {NavTabId} The destination to mark as current
 */
function activeTabId(pathname: string, hash: string): NavTabId {
  if (pathname.startsWith("/trip")) return "trips";
  if (pathname.startsWith("/places")) return "places";
  if (pathname === "/companies") return "companies";
  if (pathname === "/settings") return "settings";
  if (hash === "#trips") return "trips";
  if (hash === "#places") return "places";
  if (hash === "#companies") return "companies";
  return "home";
}

/**
 * EditorNav component
 * The editor's only chrome: one floating bar carrying the brand, the five
 * destinations, the autosave status, and the theme control. It borrows the
 * public map's floating pill so both apps read as one product, and drops to
 * the bottom of the screen on a phone where the destinations belong in reach.
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
  const { changeLanguage, currLanguage, t } = useLanguage(["editor"]);
  const { hash, pathname } = useLocation();
  const { status } = useSaveStatus();
  const activeTab = activeTabId(pathname, hash);

  return (
    <nav aria-label={t("nav.primary")} className="editor-nav">
      <Link aria-label={t("nav.brandHint")} className="editor-nav__logo" to="/">
        <LogoIcon aria-hidden="true" className="editor-nav__logo-icon" />
      </Link>
      <div className="editor-nav__tabs">
        {NAV_TABS.map(({ icon: Icon, id, to }) => (
          <Link
            aria-current={id === activeTab ? "page" : undefined}
            aria-label={t(`nav.${id}`)}
            className={classNames(
              "editor-nav__tab",
              id === activeTab && "editor-nav__tab--active",
            )}
            key={id}
            title={t(`nav.${id}`)}
            to={to}
          >
            <Icon aria-hidden="true" />
            <span className="editor-nav__tab-label">{t(`nav.${id}`)}</span>
          </Link>
        ))}
      </div>
      <div className="editor-nav__actions">
        {status ? (
          <SaveChip
            error={status.error}
            onRetry={status.retry}
            savedAt={status.savedAt}
            state={status.state}
          />
        ) : null}
        <select
          aria-label={t("nav.language")}
          className="editor-nav__language"
          onChange={(event) => changeLanguage(event.target.value)}
          value={currLanguage}
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {t(`nav.${LANGUAGE_LABEL_KEYS[locale]}`)}
            </option>
          ))}
        </select>
        <button
          aria-label={t(isDarkTheme ? "nav.switchToLight" : "nav.switchToDark")}
          className="editor-nav__theme"
          onClick={onToggleTheme}
          type="button"
        >
          {isDarkTheme ? (
            <Sun aria-hidden="true" />
          ) : (
            <Moon aria-hidden="true" />
          )}
        </button>
      </div>
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
