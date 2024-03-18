import { CSSTransition } from "react-transition-group";
import { MoonIcon, SunIcon } from "../../../assets";
import "./DarkModeButton.scss";

interface DarkModeButtonProps {
  className?: string;
  isDarkTheme: boolean;
  handleDarkModeSwitch: () => void;
}

/**
 * Button to toggle dark mode
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
  return (
    <button
      className={`dark-mode-button ${className}`}
      onClick={handleDarkModeSwitch}
      aria-label="Toggle dark mode"
    >
      <CSSTransition
        in={isDarkTheme}
        timeout={300}
        classNames="dark-mode-button__icon"
      >
        {isDarkTheme ? <MoonIcon /> : <SunIcon />}
      </CSSTransition>
    </button>
  );
}
