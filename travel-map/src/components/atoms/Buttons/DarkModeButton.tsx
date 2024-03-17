import { CSSTransition } from "react-transition-group";
import { MoonIcon, SunIcon } from "../../../assets";
import "./DarkModeButton.scss";

interface DarkModeButtonProps {
  className?: string;
  isDarkTheme: boolean;
  handleDarkModeSwitch: () => void;
}

export default function DarkModeButton({
  isDarkTheme,
  handleDarkModeSwitch,
  className = "",
}: DarkModeButtonProps) {
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
