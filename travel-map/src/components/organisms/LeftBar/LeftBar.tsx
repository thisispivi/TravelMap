import { FutureTravelsIcon, LogoIcon, VisitedIcon } from "../../../assets";
import { DarkModeButton } from "../../atoms";
import "./LeftBar.scss";
import { HomeContext } from "../../pages/Home/Home";
import { useContext } from "react";
import Button from "../../atoms/Buttons/Button";

interface LeftBarProps {
  className?: string;
  onFutureTravelsClick?: () => void;
  onVisitedCitiesClick?: () => void;
}

export default function LeftBar({
  className = "",
  onFutureTravelsClick,
  onVisitedCitiesClick,
}: LeftBarProps) {
  const context = useContext(HomeContext);
  const { isDarkTheme, handleDarkModeSwitch } = context!;
  return (
    <div className={`left-bar ${className}`}>
      <div className="left-bar__container">
        <LogoIcon />
        <div className="left-bar__buttons">
          <Button onClick={onVisitedCitiesClick} className="left-bar__button">
            <VisitedIcon />
          </Button>
          <Button onClick={onFutureTravelsClick} className="left-bar__button">
            <FutureTravelsIcon />
          </Button>
        </div>
        <DarkModeButton
          isDarkTheme={isDarkTheme}
          handleDarkModeSwitch={handleDarkModeSwitch}
        />
      </div>
    </div>
  );
}
