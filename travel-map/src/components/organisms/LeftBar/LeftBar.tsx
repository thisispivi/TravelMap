import "./LeftBar.scss";

import { motion } from "framer-motion";
import { JSX, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  FutureTravelsIcon,
  HomeIcon,
  LogoIcon,
  StatsIcon,
  VisitedIcon,
} from "@/assets";
import { HomeContextType } from "@/components/pages/Home/HomeContext";
import { useLocation } from "@/hooks/location/location";

import { DarkModeButton, NavigableButton } from "../../atoms";
import { LanguageSelector } from "..";

interface LeftBarProps {
  className?: string;
  isDarkTheme: HomeContextType["isDarkTheme"];
  handleDarkModeSwitch: HomeContextType["handleDarkModeSwitch"];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 24 },
    transform: "scale(1)",
  },
} as const;

/**
 * The left bar of the home page
 *
 * The left bar is used to display the logo and the buttons to switch
 *
 * @component
 *
 * @param {LeftBarProps} props - The props of the component
 * @param {string} props.className - The class to apply to the left bar
 * @param {boolean} props.isDarkTheme - The dark theme
 * @param {() => void} props.handleDarkModeSwitch - The function to call when the dark mode switch is clicked
 * @returns {JSX.Element} - The left bar
 */
export function LeftBar({
  className = "",
  isDarkTheme,
  handleDarkModeSwitch,
}: LeftBarProps): JSX.Element {
  const navigate = useNavigate();
  const { isGallery, isCurrentTabOpen } = useLocation();
  const { t } = useTranslation("home");

  const tabs = useMemo(() => ["lived", "visited", "future", "stats"], []);
  const buttonsConfig = useMemo(() => {
    return tabs.map((id) => ({
      id,
      isButtonActive: isCurrentTabOpen(id),
      defaultPath: `/${id}`,
      isOtherButtonsActive: tabs
        .filter((tab) => tab !== id)
        .some(isCurrentTabOpen),
      alternativePath: `/?to=${id}`,
      icon:
        id === "lived" ? (
          <HomeIcon />
        ) : id === "visited" ? (
          <VisitedIcon />
        ) : id === "future" ? (
          <FutureTravelsIcon />
        ) : (
          <StatsIcon />
        ),
      tooltipText: t(`${id}.title`),
      activeClass: `left-bar__button--${id}--active`,
      className: `left-bar__button--${id}`,
    }));
  }, [isCurrentTabOpen, t, tabs]);

  return (
    <div
      className={`left-bar ${className} ${isGallery ? "left-bar--close" : ""}`}
    >
      <div className="left-bar__container">
        <div className="left-bar__buttons--top">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <LogoIcon
              className="logo-icon"
              data-tooltip-content={t("home")}
              data-tooltip-id="base-tooltip"
              onClick={() => navigate("/")}
            />
          </motion.div>
        </div>
        <motion.div
          animate="visible"
          className="left-bar__buttons"
          initial="hidden"
          variants={containerVariants}
        >
          {buttonsConfig.map((data) => (
            <motion.div
              key={`navigable-button-${data.id}`}
              variants={itemVariants}
            >
              <NavigableButton {...data} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          animate="visible"
          className="left-bar__buttons--bottom"
          initial="hidden"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <LanguageSelector />
          </motion.div>
          <motion.div variants={itemVariants}>
            <DarkModeButton
              handleDarkModeSwitch={handleDarkModeSwitch}
              isDarkTheme={isDarkTheme}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
