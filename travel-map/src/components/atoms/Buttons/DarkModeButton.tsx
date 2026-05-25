import "./DarkModeButton.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { JSX } from "react";
import { useTranslation } from "react-i18next";

import { MoonFilledIcon, SunFilledIcon } from "@/assets";
import { classNames } from "@/utils/className";

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
 *
 * Animated theme toggle button.
 *
 * @component
 *
 * @param {DarkModeButtonProps} props - The dark mode button props
 * @param {string} [props.className] - Additional class names
 * @param {boolean} props.isDarkTheme - Whether the dark mode is currently active
 * @param {() => void} props.handleDarkModeSwitch - Toggles the theme
 * @returns {JSX.Element} The dark mode button
 */
export function DarkModeButton({
  isDarkTheme,
  handleDarkModeSwitch,
  className = "",
}: DarkModeButtonProps): JSX.Element {
  const { t } = useTranslation("home");

  return (
    <LazyMotion features={domAnimation}>
      <m.button
        aria-label={t("theme")}
        className={classNames("dark-mode-button", className)}
        data-tooltip-content={t("theme")}
        data-tooltip-id="base-tooltip"
        onClick={handleDarkModeSwitch}
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence initial={false} mode="wait">
          <m.div
            animate="animate"
            exit="exit"
            initial="initial"
            key={isDarkTheme ? "moon" : "sun"}
            variants={iconVariants}
          >
            {isDarkTheme ? <MoonFilledIcon /> : <SunFilledIcon />}
          </m.div>
        </AnimatePresence>
      </m.button>
    </LazyMotion>
  );
}
