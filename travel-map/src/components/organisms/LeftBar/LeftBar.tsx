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

/**
 * The left bar of the home page
 *
 * The left bar is used to display the logo and the buttons to switch
 *
 * @component
 *
 * @param {LeftBarProps} props - The props of the component
 * @param {string} props.className - The class to apply to the left bar
 * @param {() => void} props.onFutureTravelsClick - Function to call when the future travels button is clicked
 * @param {() => void} props.onVisitedCitiesClick - Function to call when the visited cities button is clicked
 * @returns {JSX.Element} - The left bar
 */
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
