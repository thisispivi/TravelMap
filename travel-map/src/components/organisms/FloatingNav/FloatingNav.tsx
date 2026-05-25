import "./FloatingNav.scss";

import { domAnimation, LazyMotion, m } from "framer-motion";
import { JSX, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { LogoIcon } from "@/assets";
import {
  HomeContext,
  HomeContextType,
} from "@/components/pages/Home/HomeContext";
import { useLanguage } from "@/hooks/language/language";
import { useLocation } from "@/hooks/location/location";

import { DarkModeButton } from "../../atoms";
import { LanguageSelector } from "../Language/Language";

interface FloatingNavProps {
  className?: string;
  isDarkTheme: HomeContextType["isDarkTheme"];
  handleDarkModeSwitch: HomeContextType["handleDarkModeSwitch"];
}

let navHasAnimated = false;

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

  useEffect(() => {
    navHasAnimated = true;
  }, []);

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
    if (tab.isActive) {
      navigate("/", { state: { mapOnly: true } });
      return;
    }

    if (setIsPanelOpen) setIsPanelOpen(true);
    navigate(tab.path);
  };

  return (
    <LazyMotion features={domAnimation}>
      <m.nav
        animate="visible"
        className={`floating-nav ${className} ${isGallery ? "floating-nav--hidden" : ""}`}
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
              className={`floating-nav__tab ${tab.isActive ? "floating-nav__tab--active" : ""} ${tab.isActive && !isPanelOpen ? "floating-nav__tab--panel-closed" : ""}`}
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
