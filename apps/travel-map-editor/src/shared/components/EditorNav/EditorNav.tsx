import "./EditorNav.scss";

import LogoIcon from "@travelmap/ui/assets/icons/Logo.svg?react";
import { LanguageMenu } from "@travelmap/ui/components/LanguageMenu/LanguageMenu";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { classNames } from "@travelmap/ui/lib/classNames";
import { panelSpring } from "@travelmap/ui/lib/motion";
import { m } from "framer-motion";
import { Building2, MapPinned, Moon, Route, Settings, Sun } from "lucide-react";
import { ReactNode } from "react";
import { Link, useLocation } from "react-router";

const NAV_TABS = [
  { icon: Route, id: "trips", to: "/" },
  { icon: MapPinned, id: "places", to: "/places" },
  { icon: Building2, id: "companies", to: "/companies" },
  { icon: Settings, id: "settings", to: "/settings" },
] as const;

/** One of the rail's tabs. */
type NavTabId = (typeof NAV_TABS)[number]["id"];

/**
 * Works out which tab a path belongs to: a trip belongs to Trips, a city or a
 * country to Places.
 * @param {string} pathname - The current path
 * @returns {NavTabId} The tab to highlight
 */
function activeTabId(pathname: string): NavTabId {
  if (pathname.startsWith("/places")) return "places";
  if (pathname.startsWith("/companies")) return "companies";
  if (pathname.startsWith("/settings")) return "settings";
  return "trips";
}

/**
 * Properties accepted by the EditorNav component.
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} onToggleTheme - Switches between light and dark
 */
interface EditorNavProps {
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

/**
 * EditorNav component
 * The editor's rail, the same frosted column as the site's: the logo, one
 * tab per kind of document with a highlight that slides between them, and
 * the theme and language at its foot.
 * @component
 * @param {EditorNavProps} props - The rail props
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {() => void} props.onToggleTheme - Switches between light and dark
 * @returns {ReactNode} The rail
 */
export function EditorNav({
  isDarkTheme,
  onToggleTheme,
}: EditorNavProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  const { pathname } = useLocation();
  const activeTab = activeTabId(pathname);

  return (
    <nav aria-label={t("nav.primary")} className="editor-nav">
      <Link aria-label={t("nav.brandHint")} className="editor-nav__logo" to="/">
        <LogoIcon aria-hidden="true" />
      </Link>
      <ul className="editor-nav__tabs">
        {NAV_TABS.map(({ icon: Icon, id, to }) => {
          const isActive = id === activeTab;
          return (
            <li key={id}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={classNames(
                  "editor-nav__tab",
                  isActive && "editor-nav__tab--active",
                )}
                to={to}
              >
                {isActive ? (
                  <m.span
                    className="editor-nav__indicator"
                    layoutId="editor-nav-indicator"
                    transition={panelSpring}
                  />
                ) : null}
                <Icon aria-hidden="true" className="editor-nav__icon" />
                <span className="editor-nav__label">{t(`nav.${id}`)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="editor-nav__tools">
        <button
          aria-label={t(isDarkTheme ? "nav.switchToLight" : "nav.switchToDark")}
          className="editor-nav__tool"
          onClick={onToggleTheme}
          type="button"
        >
          {isDarkTheme ? (
            <Sun aria-hidden="true" className="editor-nav__tool-icon" />
          ) : (
            <Moon aria-hidden="true" className="editor-nav__tool-icon" />
          )}
        </button>
        <LanguageMenu
          label={t("nav.language")}
          placement="beside"
          triggerClassName="editor-nav__tool"
        />
      </div>
    </nav>
  );
}
