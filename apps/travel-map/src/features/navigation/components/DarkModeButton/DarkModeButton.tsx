import "./DarkModeButton.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import MoonFilledIcon from "@/assets/icons/MoonFilled.svg?react";
import SunFilledIcon from "@/assets/icons/SunFilled.svg?react";
import { Button } from "@/shared/components/Button/Button";
import { classNames } from "@/shared/lib/classNames";

/**
 * Properties accepted by the DarkModeButton component.
 * @property {string} [className] - The class name
 * @property {boolean} isDarkTheme - Whether the dark theme is active
 * @property {() => void} handleDarkModeSwitch - The handle dark mode switch
 */
interface DarkModeButtonProps {
  className?: string;
  isDarkTheme: boolean;
  handleDarkModeSwitch: () => void;
}

const iconVariants = {
  initial: { opacity: 0, rotate: -90, scale: 0.4 },
  animate: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  exit: {
    opacity: 0,
    rotate: 90,
    scale: 0.4,
    transition: { duration: 0.2 },
  },
} as const;

/**
 * DarkModeButton component
 * Theme toggle. Wraps the shared button so it matches every other icon action
 * in the navigation, and adds the rotate-and-fade swap between the two icons.
 * @component
 * @param {DarkModeButtonProps} props - The dark mode button props
 * @param {boolean} props.isDarkTheme - Whether the dark mode is currently active
 * @param {() => void} props.handleDarkModeSwitch - Toggles the theme
 * @param {string} [props.className=""] - Additional class names
 * @returns {ReactNode} The dark mode button
 */
export function DarkModeButton({
  isDarkTheme,
  handleDarkModeSwitch,
  className = "",
}: DarkModeButtonProps): ReactNode {
  const { t } = useTranslation("home");

  return (
    <Button
      ariaLabel={t("theme")}
      className={classNames("dark-mode-button", className)}
      onClick={handleDarkModeSwitch}
      tooltipContent={t("theme")}
      tooltipId="base-tooltip"
    >
      <LazyMotion features={domAnimation}>
        <AnimatePresence initial={false} mode="wait">
          <m.span
            animate="animate"
            className="dark-mode-button__icon"
            exit="exit"
            initial="initial"
            key={isDarkTheme ? "moon" : "sun"}
            variants={iconVariants}
          >
            {isDarkTheme ? <MoonFilledIcon /> : <SunFilledIcon />}
          </m.span>
        </AnimatePresence>
      </LazyMotion>
    </Button>
  );
}
