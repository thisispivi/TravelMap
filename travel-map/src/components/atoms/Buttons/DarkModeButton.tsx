import "./DarkModeButton.scss";

import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import { JSX } from "react";
import { useTranslation } from "react-i18next";

import { MoonIcon, SunIcon } from "@/assets";

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
 * Button to toggle dark mode
 *
 * The dark mode button is used to toggle the dark mode.
 *
 * @component
 *
 * @param {DarkModeButtonProps} props - The props of the component
 * @param {string} props.className - The class to apply to the button
 * @param {boolean} props.isDarkTheme - Whether the dark mode is currently active
 * @param {() => void} props.handleDarkModeSwitch - Function to switch the dark mode
 * @returns {JSX.Element} - The dark mode button
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
        className={`dark-mode-button ${className}`}
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
            {isDarkTheme ? <MoonIcon /> : <SunIcon />}
          </m.div>
        </AnimatePresence>
      </m.button>
    </LazyMotion>
  );
}
