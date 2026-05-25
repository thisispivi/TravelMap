import "./FloatingNav.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { LogoIcon } from "@/assets";
import {
  HomeContext,
  HomeContextType,
} from "@/components/pages/Home/HomeContext";
import { useLanguage } from "@/hooks/language/language";
import { useLocation } from "@/hooks/location/location";
import { classNames } from "@/utils/className";

import { DarkModeButton } from "../../atoms";
import { LanguageSelector } from "../Language/Language";

interface FloatingNavProps {
  className?: string;
  isDarkTheme: HomeContextType["isDarkTheme"];
  handleDarkModeSwitch: HomeContextType["handleDarkModeSwitch"];
}

/**
 * FloatingNav component
 *
 * Primary navigation bar. On desktop it appears as a left-side panel; on mobile
 * it floats at the bottom of the screen. Contains tab navigation, the language
 * selector, and the dark-mode toggle.
 *
 * Clicking an active tab collapses the side panel and navigates to the map-only
 * view. Switching from a full-page route (Timeline, Stats) to a panel route
 * (Trips, Places) animates the panel close before opening the new one.
 *
 * @component
 *
 * @param {FloatingNavProps} props
 * @param {string} [props.className] - Additional class names
 * @param {boolean} props.isDarkTheme - Current theme state
 * @param {() => void} props.handleDarkModeSwitch - Toggles dark / light mode
 * @returns {JSX.Element} The navigation bar
 */

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

type NavTab = {
  id: "trips" | "places" | "timeline" | "stats";
  path: string;
};

const NAV_TABS: NavTab[] = [
  { id: "trips", path: "/trips" },
  { id: "places", path: "/places" },
  { id: "timeline", path: "/timeline" },
  { id: "stats", path: "/stats" },
];

export function FloatingNav({
  className = "",
  isDarkTheme,
  handleDarkModeSwitch,
}: FloatingNavProps): JSX.Element {
  const navigate = useNavigate();
  const { activeTab, isGallery } = useLocation();
  const { t } = useLanguage(["home"]);
  const context = useContext(HomeContext);
  const isPanelOpen = context?.isPanelOpen ?? true;
  const setIsPanelOpen = context?.setIsPanelOpen;
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

    setIsPanelOpen?.(true);
    pendingOpenTabRef.current = null;
  }, [activeTab, setIsPanelOpen]);

  const tabs = useMemo(
    () =>
      NAV_TABS.map((tab) => ({
        ...tab,
        label: t(`nav.${tab.id}`),
        isActive: activeTab === tab.id,
      })),
    [activeTab, t],
  );

  const handleTabClick = (tab: (typeof tabs)[0]) => {
    if (closePanelTimeoutRef.current !== null) {
      window.clearTimeout(closePanelTimeoutRef.current);
      closePanelTimeoutRef.current = null;
    }
    pendingOpenTabRef.current = null;

    const isLeavingBottomPanel =
      (activeTab === "stats" || activeTab === "timeline") &&
      (tab.id === "trips" || tab.id === "places");

    if (tab.isActive) {
      if (setIsPanelOpen) {
        setIsPanelOpen(false);
        closePanelTimeoutRef.current = window.setTimeout(() => {
          navigate("/", { state: { mapOnly: true } });
          closePanelTimeoutRef.current = null;
        }, PANEL_CLOSE_DELAY_MS);
        return;
      }

      navigate("/", { state: { mapOnly: true } });
      return;
    }

    if (isLeavingBottomPanel && setIsPanelOpen) {
      setIsPanelOpen(false);
      closePanelTimeoutRef.current = window.setTimeout(() => {
        pendingOpenTabRef.current = tab.id;
        navigate(tab.path);
        closePanelTimeoutRef.current = null;
      }, PANEL_CLOSE_DELAY_MS);
      return;
    }

    if (setIsPanelOpen) setIsPanelOpen(true);
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
          <m.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
            <LogoIcon
              className="floating-nav__logo-icon"
              onClick={() => navigate("/")}
            />
          </m.div>
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
