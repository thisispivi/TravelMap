import "./NavRail.scss";

import { m } from "framer-motion";
import { LucideIcon, Moon, Sun } from "lucide-react";
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
 * The theme switch and the language menu, at the foot of the rail or, on a
 * phone, floating in the top corner.
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
  const { t } = useLanguage([]);

  return (
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
        placement={isCompact ? "below" : "beside"}
        triggerClassName="nav-rail__tool"
      />
    </>
  );
}

/**
 * Properties accepted by the NavRail component.
 * @property {NavRailItem[]} items - The tabs, in order
 * @property {string | undefined} activeId - The tab of the page on screen, if any
 * @property {(id: string) => void} onSelect - Opens a tab
 * @property {string} logoLabel - What pressing the logo does
 * @property {() => void} onLogo - Presses the logo
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} onToggleTheme - Switches between light and dark
 * @property {boolean} [isCompact] - Whether the phone layout is active
 * @property {boolean} [hasFloatingTools] - Whether, on a phone, the tools float in the top corner
 */
interface NavRailProps {
  items: NavRailItem[];
  activeId: string | undefined;
  onSelect: (id: string) => void;
  logoLabel: string;
  onLogo: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  isCompact?: boolean;
  hasFloatingTools?: boolean;
}

/**
 * NavRail component
 * The primary navigation of both apps: a frosted rail down the left edge with
 * the logo, one tab per section under a highlight that slides between them,
 * and the theme and language at its foot. On a phone it becomes a tab bar
 * along the bottom, and its tools float in the top corner when the screen
 * has room for them.
 * @component
 * @param {NavRailProps} props - The rail props
 * @param {NavRailItem[]} props.items - The tabs, in order
 * @param {string | undefined} props.activeId - The tab of the page on screen, if any
 * @param {(id: string) => void} props.onSelect - Opens a tab
 * @param {string} props.logoLabel - What pressing the logo does
 * @param {() => void} props.onLogo - Presses the logo
 * @param {boolean} props.isDarkTheme - Whether the dark theme is active
 * @param {() => void} props.onToggleTheme - Switches between light and dark
 * @param {boolean} [props.isCompact=false] - Whether the phone layout is active
 * @param {boolean} [props.hasFloatingTools=false] - Whether, on a phone, the tools float in the top corner
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
  hasFloatingTools = false,
}: NavRailProps): ReactNode {
  const { t } = useLanguage([]);
  const tools = (
    <NavTools
      isCompact={isCompact}
      isDarkTheme={isDarkTheme}
      onToggleTheme={onToggleTheme}
    />
  );

  return (
    <>
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
          {items.map(({ href, icon: Icon, id, label }) => {
            const isActive = id === activeId;
            return (
              <li className="nav-rail__item" key={id}>
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
                    onSelect(id);
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
              </li>
            );
          })}
        </ul>
        {isCompact ? null : <div className="nav-rail__tools">{tools}</div>}
      </nav>
      {isCompact && hasFloatingTools ? (
        <div className="nav-rail__floating-tools">{tools}</div>
      ) : null}
    </>
  );
}
