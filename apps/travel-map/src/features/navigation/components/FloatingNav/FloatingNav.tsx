import "./FloatingNav.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import LogoIcon from "@/assets/icons/Logo.svg?react";
import { NavTabId, useAppRoute } from "@/shared/context/AppRoute.context";
import { usePanel } from "@/shared/context/Panel.context";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { classNames } from "@/shared/lib/classNames";

import { DarkModeButton } from "../DarkModeButton/DarkModeButton";
import { LanguageSelector } from "../LanguageSelector/LanguageSelector";

/**
 * Properties accepted by the FloatingNav component.
 * @property {string} [className] - The class name
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} handleDarkModeSwitch - Toggles the active theme
 */
interface FloatingNavProps {
  className?: string;
  isDarkTheme: boolean;
  handleDarkModeSwitch: () => void;
}
let navHasAnimated = false;
const PANEL_CLOSE_DELAY_MS = 220;
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.08 },
  },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 24 },
  },
} as const;

/**
 * Represents a nav tab.
 * @property {NavTabId} id - The id
 * @property {string} path - The path
 */
type NavTab = {
  id: NavTabId;
  path: string;
};
const NAV_TABS: NavTab[] = [
  { id: "trips", path: "/trips" },
  { id: "places", path: "/places" },
  { id: "timeline", path: "/timeline" },
  { id: "stats", path: "/stats" },
];

/**
 * FloatingNav component
 * Primary navigation bar. On desktop it appears as a left-side panel; on mobile
 * it floats at the bottom of the screen. Clicking an active tab collapses the
 * side panel before navigation when a transition is required.
 * @component
 * @param {FloatingNavProps} props
 * @param {string} [props.className=""] - Additional class names
 * @param {boolean} props.isDarkTheme - Current theme state
 * @param {() => void} props.handleDarkModeSwitch - Toggles dark and light mode
 * @returns {ReactNode} The navigation bar
 */
export function FloatingNav({
  className = "",
  isDarkTheme,
  handleDarkModeSwitch,
}: FloatingNavProps): ReactNode {
  const navigate = useNavigate();
  const { activeTab, isGallery } = useAppRoute();
  const { t } = useLanguage(["home"]);
  const { isPanelOpen, setIsPanelOpen } = usePanel();
  const [skipAnimation] = useState(() => navHasAnimated);
  const closePanelTimeoutRef = useRef<number | null>(null);
  const pendingOpenTabRef = useRef<NavTab["id"] | null>(null);
  useEffect(() => {
    navHasAnimated = true;
  }, []);
  useEffect(
    () => () => {
      if (closePanelTimeoutRef.current !== null) {
        window.clearTimeout(closePanelTimeoutRef.current);
      }
      pendingOpenTabRef.current = null;
    },
    [],
  );
  useEffect(() => {
    if (pendingOpenTabRef.current !== activeTab) return;
    setIsPanelOpen(true);
    pendingOpenTabRef.current = null;
  }, [activeTab, setIsPanelOpen]);
  const tabs = NAV_TABS.map((tab) => ({
    ...tab,
    label: t(`nav.${tab.id}`),
    isActive: activeTab === tab.id,
  }));

  /**
   * Opens, closes, or switches the panel represented by a navigation tab.
   * @param {(typeof tabs)[0]} tab - The selected navigation tab
   * @returns {void}
   */
  const handleTabClick = (tab: (typeof tabs)[0]): void => {
    if (closePanelTimeoutRef.current !== null) {
      window.clearTimeout(closePanelTimeoutRef.current);
      closePanelTimeoutRef.current = null;
    }
    pendingOpenTabRef.current = null;
    const isLeavingBottomPanel =
      (activeTab === "stats" || activeTab === "timeline") &&
      (tab.id === "trips" || tab.id === "places");
    if (tab.isActive) {
      if (!isPanelOpen) {
        setIsPanelOpen(true);
        return;
      }
      setIsPanelOpen(false);
      closePanelTimeoutRef.current = window.setTimeout(() => {
        navigate("/", { state: { mapOnly: true } });
        closePanelTimeoutRef.current = null;
      }, PANEL_CLOSE_DELAY_MS);
      return;
    }
    if (isLeavingBottomPanel) {
      setIsPanelOpen(false);
      closePanelTimeoutRef.current = window.setTimeout(() => {
        pendingOpenTabRef.current = tab.id;
        navigate(tab.path);
        closePanelTimeoutRef.current = null;
      }, PANEL_CLOSE_DELAY_MS);
      return;
    }
    setIsPanelOpen(true);
    navigate(tab.path);
  };
  return (
    <LazyMotion features={domAnimation}>
      <m.nav
        animate="visible"
        className={classNames(
          "floating-nav",
          className,
          isGallery && "floating-nav--hidden",
        )}
        initial={skipAnimation ? false : "hidden"}
        variants={containerVariants}
      >
        <m.div
          className="floating-nav__logo"
          variants={skipAnimation ? undefined : itemVariants}
        >
          <m.button
            aria-label={t("goHome")}
            className="floating-nav__logo-button"
            onClick={() => navigate("/")}
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogoIcon className="floating-nav__logo-icon" />
          </m.button>
        </m.div>

        <div className="floating-nav__tabs">
          {tabs.map((tab) => (
            <m.button
              className={classNames(
                "floating-nav__tab",
                tab.isActive && "floating-nav__tab--active",
                tab.isActive &&
                  !isPanelOpen &&
                  "floating-nav__tab--panel-closed",
              )}
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              type="button"
              variants={skipAnimation ? undefined : itemVariants}
            >
              {tab.isActive ? (
                <m.div
                  className="floating-nav__tab-indicator"
                  layoutId="nav-indicator"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              ) : null}
              <span className="floating-nav__tab-label">{tab.label}</span>
            </m.button>
          ))}
        </div>

        <m.div
          className="floating-nav__actions"
          variants={skipAnimation ? undefined : itemVariants}
        >
          <LanguageSelector />
          <DarkModeButton
            handleDarkModeSwitch={handleDarkModeSwitch}
            isDarkTheme={isDarkTheme}
          />
        </m.div>
      </m.nav>
    </LazyMotion>
  );
}
