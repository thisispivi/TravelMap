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
import { ReactNode, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import LogoIcon from "@/assets/icons/Logo.svg?react";
import { SUPPORTED_LOCALES, SupportedLocale } from "@/i18n/locale";
import { CountryFlag } from "@/shared/components/CountryFlag/CountryFlag";
import { Popover } from "@/shared/components/Popover/Popover";
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

/* English is drawn with the United Kingdom's flag, as the old switcher did. */
const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  "en-US": "UnitedKingdom",
  "it-IT": "Italy",
};

/**
 * Names a locale in its own language, such as `English` or `Italiano`.
 * @param {SupportedLocale} locale - The locale
 * @returns {string} Its native name
 */
function nativeName(locale: SupportedLocale): string {
  const language = locale.slice(0, 2);
  const name =
    new Intl.DisplayNames([locale], { type: "language" }).of(language) ??
    language;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

/**
 * Properties accepted by the LanguageMenu component.
 * @property {boolean} isCompact - Whether the menu drops down from the phone toolbar rather than opening beside the rail
 */
interface LanguageMenuProps {
  isCompact: boolean;
}

/**
 * LanguageMenu component
 * The current language's flag; pressing it lists every language by flag and
 * native name in a frosted popover, beside the rail or under the phone
 * toolbar.
 * @component
 * @param {LanguageMenuProps} props - The menu props
 * @param {boolean} props.isCompact - Whether the menu drops down from the phone toolbar
 * @returns {ReactNode} The language menu
 */
function LanguageMenu({ isCompact }: LanguageMenuProps): ReactNode {
  const { t, currLanguage, changeLanguage } = useLanguage(["home"]);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        aria-expanded={anchor !== null}
        aria-label={t("language")}
        className="app-nav__tool"
        onClick={(event) =>
          setAnchor(anchor ? null : event.currentTarget.getBoundingClientRect())
        }
        ref={triggerRef}
        type="button"
      >
        <CountryFlag
          className="app-nav__tool-flag"
          countryId={LOCALE_FLAGS[currLanguage]}
        />
      </button>
      <Popover
        anchor={anchor}
        onClose={() => setAnchor(null)}
        placement={isCompact ? "below" : "beside"}
        triggerRef={triggerRef}
      >
        <ul className="app-nav__languages">
          {SUPPORTED_LOCALES.map((locale) => (
            <li key={locale}>
              <button
                aria-pressed={locale === currLanguage}
                className={classNames(
                  "app-nav__language-option",
                  locale === currLanguage && "app-nav__language-option--active",
                )}
                onClick={() => {
                  changeLanguage(locale);
                  setAnchor(null);
                }}
                type="button"
              >
                <CountryFlag
                  className="app-nav__tool-flag"
                  countryId={LOCALE_FLAGS[locale]}
                />
                {nativeName(locale)}
              </button>
            </li>
          ))}
        </ul>
      </Popover>
    </>
  );
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
      <LanguageMenu isCompact={isCompact} />
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
