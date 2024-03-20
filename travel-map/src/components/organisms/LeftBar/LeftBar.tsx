import { FutureTravelsIcon, LogoIcon, VisitedIcon } from "../../../assets";
import { DarkModeButton } from "../../atoms";
import "./LeftBar.scss";
import { HomeContext } from "../../pages/Home/Home";
import { memo, useContext } from "react";
import Button from "../../atoms/Buttons/Button";
import { Mode } from "../../../typings/mode";

interface LeftBarProps {
  className?: string;
  currMode?: Mode;
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
 * @param {Mode} props.currMode - The current mode
 * @param {() => void} props.onFutureTravelsClick - Function to call when the future travels button is clicked
 * @param {() => void} props.onVisitedCitiesClick - Function to call when the visited cities button is clicked
 * @returns {JSX.Element} - The left bar
 */
export default memo(function LeftBar({
  className = "",
  currMode,
  onFutureTravelsClick,
  onVisitedCitiesClick,
}: LeftBarProps): JSX.Element {
  const context = useContext(HomeContext);
  const { isDarkTheme, handleDarkModeSwitch } = context!;
  return (
    <div className={`left-bar ${className}`}>
      <div className="left-bar__container">
        <LogoIcon />
        <div className="left-bar__buttons">
          <Button
            onClick={onVisitedCitiesClick}
            className={`left-bar__button ${
              currMode === Mode.VISITED
                ? "left-bar__button--visited--active"
                : ""
            }`}
          >
            <VisitedIcon />
          </Button>
          <Button
            onClick={onFutureTravelsClick}
            className={`left-bar__button ${
              currMode === Mode.FUTURE ? "left-bar__button--future--active" : ""
            }`}
          >
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
});
