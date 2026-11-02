import "./NavRail.scss";

import { m } from "framer-motion";
import { LucideIcon, Moon, Settings, Sun } from "lucide-react";
import { MouseEvent, ReactNode } from "react";

import LogoIcon from "../../assets/icons/Logo.svg?react";
import { useLanguage } from "../../hooks/useLanguage";
import { classNames } from "../../lib/classNames";
import { panelSpring } from "../../lib/motion";
import { LanguageMenu } from "../LanguageMenu/LanguageMenu";

/**
 * One tab of the rail.
 * @property {string} id - Identifies the tab to `onSelect`
 * @property {string} href - Where it leads when opened in a new tab
 * @property {string} label - Its visible name
 * @property {LucideIcon} icon - Its icon
 */
export interface NavRailItem {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Tells whether a press on a link asks the browser for a new tab or window,
 * which the link should then do by itself.
 * @param {MouseEvent} event - The press
 * @returns {boolean} Whether a modifier key was held
 */
function opensElsewhere(event: MouseEvent): boolean {
  return event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
}

/**
 * The way to an app's settings page, which keeps to the foot of the rail.
 * @property {string} href - Where it leads when opened in a new tab
 * @property {string} label - Its visible name
 * @property {boolean} isActive - Whether the settings page is on screen
 * @property {() => void} onSelect - Opens the page
 */
export interface NavRailSettings {
  href: string;
  label: string;
  isActive: boolean;
  onSelect: () => void;
}

/**
 * Properties accepted by the NavTab component.
 * @property {string} href - Where it leads when opened in a new tab
 * @property {LucideIcon} icon - Its icon
 * @property {boolean} isActive - Whether its page is on screen
 * @property {string} label - Its visible name
 * @property {() => void} onSelect - Opens its page
 */
interface NavTabProps {
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onSelect: () => void;
}

/**
 * NavTab component
 * One destination of the navigation, an icon over its name, under the highlight
 * that slides between them. A press with a modifier key is left to the browser.
 * @component
 * @param {NavTabProps} props - The tab props
 * @param {string} props.href - Where it leads when opened in a new tab
 * @param {LucideIcon} props.icon - Its icon
 * @param {boolean} props.isActive - Whether its page is on screen
 * @param {string} props.label - Its visible name
 * @param {() => void} props.onSelect - Opens its page
 * @returns {ReactNode} The tab
 */
function NavTab({
  href,
  icon: Icon,
  isActive,
  label,
  onSelect,
}: NavTabProps): ReactNode {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={classNames(
        "nav-rail__tab",
        isActive && "nav-rail__tab--active",
      )}
      href={href}
      onClick={(event) => {
        if (opensElsewhere(event)) return;
        event.preventDefault();
        onSelect();
      }}
    >
      {isActive ? (
        <m.span
          className="nav-rail__indicator"
          layoutId="nav-rail-indicator"
          transition={panelSpring}
        />
      ) : null}
      <Icon aria-hidden="true" className="nav-rail__icon" />
      <span className="nav-rail__label">{label}</span>
    </a>
  );
}

/**
 * Properties accepted by the NavTools component.
 * @property {boolean} [isDarkTheme] - Whether the dark theme is active
 * @property {() => void} [onToggleTheme] - Switches between light and dark
 * @property {NavRailSettings} [settings] - The way to the settings page, if the app has one
 */
interface NavToolsProps {
  isDarkTheme?: boolean;
  onToggleTheme?: () => void;
  settings?: NavRailSettings;
}

/**
 * NavTools component
 * The foot of the rail. An app with a settings page shows only the way to it,
 * since the theme and language live there; otherwise the rail offers them itself.
 * @component
 * @param {NavToolsProps} props - The tools props
 * @param {boolean} [props.isDarkTheme] - Whether the dark theme is active
 * @param {() => void} [props.onToggleTheme] - Switches between light and dark
 * @param {NavRailSettings} [props.settings] - The way to the settings page
 * @returns {ReactNode} The tools
 */
function NavTools({
  isDarkTheme,
  onToggleTheme,
  settings,
}: NavToolsProps): ReactNode {
  const { t } = useLanguage([]);

  return (
    <div className="nav-rail__tools">
      {settings ? (
        <NavTab
          href={settings.href}
          icon={Settings}
          isActive={settings.isActive}
          label={settings.label}
          onSelect={settings.onSelect}
        />
      ) : (
        <>
          <button
            aria-label={t(
              isDarkTheme
                ? "common:theme.switchToLight"
                : "common:theme.switchToDark",
            )}
            className="nav-rail__tool"
            onClick={onToggleTheme}
            type="button"
          >
            {isDarkTheme ? (
              <Sun aria-hidden="true" className="nav-rail__tool-icon" />
            ) : (
              <Moon aria-hidden="true" className="nav-rail__tool-icon" />
            )}
          </button>
          <LanguageMenu
            label={t("common:language")}
            placement="beside"
            triggerClassName="nav-rail__tool"
          />
        </>
      )}
    </div>
  );
}

/**
 * Properties accepted by the NavRail component.
 * @property {NavRailItem[]} items - The tabs, in order
 * @property {string | undefined} activeId - The tab of the page on screen, if any
 * @property {(id: string) => void} onSelect - Opens a tab
 * @property {string} logoLabel - What pressing the logo does
 * @property {() => void} onLogo - Presses the logo
 * @property {boolean} [isDarkTheme] - Whether the dark theme is active, without settings
 * @property {() => void} [onToggleTheme] - Switches between light and dark, without settings
 * @property {boolean} [isCompact] - Whether the phone layout is active
 * @property {NavRailSettings} [settings] - The way to the settings page, if the app has one
 */
interface NavRailProps {
  items: NavRailItem[];
  activeId: string | undefined;
  onSelect: (id: string) => void;
  logoLabel: string;
  onLogo: () => void;
  isDarkTheme?: boolean;
  onToggleTheme?: () => void;
  isCompact?: boolean;
  settings?: NavRailSettings;
}

/**
 * NavRail component
 * The primary navigation of both apps: a frosted rail down the left edge with
 * the logo, one tab per section from the top under a highlight that slides
 * between them, and the settings, or the theme and language, at its foot. On a
 * phone it becomes a tab bar along the bottom, without the foot: an app with
 * settings gives them a tab there.
 * @component
 * @param {NavRailProps} props - The rail props
 * @param {NavRailItem[]} props.items - The tabs, in order
 * @param {string | undefined} props.activeId - The tab of the page on screen, if any
 * @param {(id: string) => void} props.onSelect - Opens a tab
 * @param {string} props.logoLabel - What pressing the logo does
 * @param {() => void} props.onLogo - Presses the logo
 * @param {boolean} [props.isDarkTheme] - Whether the dark theme is active
 * @param {() => void} [props.onToggleTheme] - Switches between light and dark
 * @param {boolean} [props.isCompact=false] - Whether the phone layout is active
 * @param {NavRailSettings} [props.settings] - The way to the settings page
 * @returns {ReactNode} The navigation
 */
export function NavRail({
  items,
  activeId,
  onSelect,
  logoLabel,
  onLogo,
  isDarkTheme,
  onToggleTheme,
  isCompact = false,
  settings,
}: NavRailProps): ReactNode {
  const { t } = useLanguage([]);

  return (
    <nav aria-label={t("common:nav.label")} className="nav-rail">
      {isCompact ? null : (
        <button
          aria-label={logoLabel}
          className="nav-rail__logo"
          onClick={onLogo}
          type="button"
        >
          <LogoIcon aria-hidden="true" />
        </button>
      )}
      <ul className="nav-rail__tabs">
        {items.map(({ href, icon, id, label }) => (
          <li className="nav-rail__item" key={id}>
            <NavTab
              href={href}
              icon={icon}
              isActive={id === activeId}
              label={label}
              onSelect={() => onSelect(id)}
            />
          </li>
        ))}
      </ul>
      {isCompact ? null : (
        <NavTools
          isDarkTheme={isDarkTheme}
          onToggleTheme={onToggleTheme}
          settings={settings}
        />
      )}
    </nav>
  );
}
