import "./AppNav.scss";

import { m } from "framer-motion";
import {
  CalendarRange,
  ChartColumn,
  Images,
  LucideIcon,
  MapPin,
  Moon,
  Route,
  Sun,
} from "lucide-react";
import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

import LogoIcon from "@/assets/icons/Logo.svg?react";
import { LanguageMenu } from "@/shared/components/LanguageMenu/LanguageMenu";
import { NavTabId, useAppRoute } from "@/shared/context/AppRoute.context";
import { usePanel } from "@/shared/context/Panel.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";
import { panelSpring } from "@/shared/lib/motion";

/**
 * One navigation tab.
 * @property {NavTabId} id - The tab
 * @property {string} path - The route it opens
 * @property {LucideIcon} icon - Its icon
 */
interface NavTab {
  id: NavTabId;
  path: string;
  icon: LucideIcon;
}

const NAV_TABS: NavTab[] = [
  { icon: Route, id: "trips", path: "/trips" },
  { icon: MapPin, id: "places", path: "/places" },
  { icon: Images, id: "gallery", path: "/gallery" },
  { icon: CalendarRange, id: "timeline", path: "/timeline" },
  { icon: ChartColumn, id: "stats", path: "/stats" },
];

/**
 * Properties accepted by the AppNav component.
 * @property {boolean} isCompact - Whether the phone layout is active
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} onToggleTheme - Switches between light and dark
 */
interface AppNavProps {
  isCompact: boolean;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

/**
 * Properties accepted by the NavTools component.
 * @property {boolean} isCompact - Whether the phone layout is active
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} onToggleTheme - Switches between light and dark
 */
interface NavToolsProps {
  isCompact: boolean;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

/**
 * NavTools component
 * The theme switch and the language menu.
 * @component
 * @param {NavToolsProps} props - The tools props
 * @param {boolean} props.isCompact - Whether the phone layout is active
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {() => void} props.onToggleTheme - Switches between light and dark
 * @returns {ReactNode} The tool buttons
 */
function NavTools({
  isCompact,
  isDarkTheme,
  onToggleTheme,
}: NavToolsProps): ReactNode {
  const { t } = useLanguage(["home"]);

  return (
    <>
      <button
        aria-label={t("theme")}
        className="app-nav__tool"
        onClick={onToggleTheme}
        type="button"
      >
        {isDarkTheme ? (
          <Sun aria-hidden="true" className="app-nav__tool-icon" />
        ) : (
          <Moon aria-hidden="true" className="app-nav__tool-icon" />
        )}
      </button>
      <LanguageMenu
        label={t("language")}
        placement={isCompact ? "below" : "beside"}
        triggerClassName="app-nav__tool"
      />
    </>
  );
}

/**
 * AppNav component
 * The primary navigation: a glass rail down the left edge on wider screens,
 * a tab bar along the bottom on phones. Choosing the tab already open toggles
 * its panel, so the map can be seen in full without leaving the tab.
 * @component
 * @param {AppNavProps} props - The navigation props
 * @param {boolean} props.isCompact - Whether the phone layout is active
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {() => void} props.onToggleTheme - Switches between light and dark
 * @returns {ReactNode} The navigation
 */
export function AppNav({
  isCompact,
  isDarkTheme,
  onToggleTheme,
}: AppNavProps): ReactNode {
  const { t } = useLanguage(["home"]);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { activeTab, surface } = useAppRoute();
  const { isPanelOpen, setIsPanelOpen } = usePanel();

  /**
   * Opens a tab, or toggles its panel when it is already the open route.
   * @param {NavTab} tab - The chosen tab
   * @returns {void}
   */
  const handleSelectTab = (tab: NavTab): void => {
    if (pathname === tab.path) {
      setIsPanelOpen(!isPanelOpen);
      return;
    }
    setIsPanelOpen(true);
    navigate(tab.path);
  };

  return (
    <>
      <nav aria-label={t("nav.label")} className="app-nav">
        {isCompact ? null : (
          <button
            aria-label={t("goHome")}
            className="app-nav__logo"
            onClick={() => navigate("/", { state: { mapOnly: true } })}
            type="button"
          >
            <LogoIcon aria-hidden="true" />
          </button>
        )}
        <ul className="app-nav__tabs">
          {NAV_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            const Icon = tab.icon;
            return (
              <li className="app-nav__item" key={tab.id}>
                <button
                  aria-current={isActive ? "page" : undefined}
                  className={classNames(
                    "app-nav__tab",
                    isActive && "app-nav__tab--active",
                  )}
                  onClick={() => handleSelectTab(tab)}
                  type="button"
                >
                  {isActive ? (
                    <m.span
                      className="app-nav__indicator"
                      layoutId="app-nav-indicator"
                      transition={panelSpring}
                    />
                  ) : null}
                  <Icon aria-hidden="true" className="app-nav__icon" />
                  <span className="app-nav__label">{t(`nav.${tab.id}`)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {isCompact ? null : (
          <div className="app-nav__tools">
            <NavTools
              isCompact={isCompact}
              isDarkTheme={isDarkTheme}
              onToggleTheme={onToggleTheme}
            />
          </div>
        )}
      </nav>
      {/* A page has its own header where these would collide. */}
      {isCompact && surface !== "page" ? (
        <div className="app-nav__floating-tools">
          <NavTools
            isCompact={isCompact}
            isDarkTheme={isDarkTheme}
            onToggleTheme={onToggleTheme}
          />
        </div>
      ) : null}
    </>
  );
}
