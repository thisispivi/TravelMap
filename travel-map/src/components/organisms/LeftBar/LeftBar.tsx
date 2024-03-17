import { LogoIcon } from "../../../assets";
import { DarkModeButton } from "../../atoms";
import "./LeftBar.scss";
import { HomeContext } from "../../pages/Home/Home";
import { useContext } from "react";

interface LeftBarProps {
  className?: string;
}

export default function LeftBar({ className = "" }: LeftBarProps) {
  const context = useContext(HomeContext);
  const { isDarkTheme, handleDarkModeSwitch } = context!;
  return (
    <div className={`left-bar ${className}`}>
      <div className="left-bar__container">
        <LogoIcon />
        <DarkModeButton
          isDarkTheme={isDarkTheme}
          handleDarkModeSwitch={handleDarkModeSwitch}
        />
      </div>
    </div>
  );
}
