import { FutureTravelsIcon, LogoIcon, VisitedIcon } from "../../../assets";
import { DarkModeButton } from "../../atoms";
import "./LeftBar.scss";
import { HomeContext } from "../../pages/Home/Home";
import { memo, useContext } from "react";
import Button from "../../atoms/Buttons/Button";
import { Link } from "react-router-dom";
import useLocation from "../../../hooks/location/location";

interface LeftBarProps {
  className?: string;
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
 * @returns {JSX.Element} - The left bar
 */
export default memo(function LeftBar({
  className = "",
}: LeftBarProps): JSX.Element {
  const { isVisited, isFuture } = useLocation();
  const context = useContext(HomeContext);
  const { isDarkTheme, handleDarkModeSwitch } = context!;
  return (
    <div className={`left-bar ${className}`}>
      <div className="left-bar__container">
        <LogoIcon />
        <div className="left-bar__buttons">
          <Link to={isVisited ? "/" : isFuture ? "/?to=visited" : "/visited"}>
            <Button
              className={`left-bar__button ${isVisited ? "left-bar__button--visited--active" : ""}`}
            >
              <VisitedIcon />
            </Button>
          </Link>
          <Link to={isFuture ? "/" : isVisited ? "/?to=future" : "/future"}>
            <Button
              className={`left-bar__button ${isFuture ? "left-bar__button--future--active" : ""}`}
            >
              <FutureTravelsIcon />
            </Button>
          </Link>
        </div>
        <DarkModeButton
          isDarkTheme={isDarkTheme}
          handleDarkModeSwitch={handleDarkModeSwitch}
        />
      </div>
    </div>
  );
});
