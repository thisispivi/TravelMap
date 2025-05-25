import { CSSTransition } from "react-transition-group";
import { MoonIcon, SunIcon } from "@/assets";
import "./DarkModeButton.scss";
import { JSX, useRef } from "react";
import { useTranslation } from "react-i18next";

interface DarkModeButtonProps {
  className?: string;
  isDarkTheme: boolean;
  handleDarkModeSwitch: () => void;
}

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
export default function DarkModeButton({
  isDarkTheme,
  handleDarkModeSwitch,
  className = "",
}: DarkModeButtonProps): JSX.Element {
  const { t } = useTranslation("home");
  const nodeRef = useRef(null);

  return (
    <button
      aria-label={t("theme")}
      className={`dark-mode-button ${className}`}
      data-tooltip-content={t("theme")}
      data-tooltip-id="base-tooltip"
      onClick={handleDarkModeSwitch}
      type="button"
    >
      <CSSTransition
        classNames="dark-mode-button__icon"
        in={isDarkTheme}
        nodeRef={nodeRef}
        timeout={300}
      >
        <div ref={nodeRef}>{isDarkTheme ? <MoonIcon /> : <SunIcon />}</div>
      </CSSTransition>
    </button>
  );
}
