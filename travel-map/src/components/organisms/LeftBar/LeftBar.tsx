import { FutureTravelsIcon, LogoIcon, VisitedIcon } from "../../../assets";
import { DarkModeButton } from "../../atoms";
import "./LeftBar.scss";
import { HomeContext } from "../../pages/Home/Home";
import { memo, useContext } from "react";
import Button from "../../atoms/Buttons/Button";
import { Link, useNavigate } from "react-router-dom";
import useLocation from "../../../hooks/location/location";
import { LanguageSelctor } from "..";

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
  const navigate = useNavigate();
  const { isVisited, isFuture, isGallery } = useLocation();
  const context = useContext(HomeContext);
  const { isDarkTheme, handleDarkModeSwitch } = context!;
  return (
    <div
      className={`left-bar ${className} ${isGallery ? "left-bar--close" : ""}`}
    >
      <div className="left-bar__container">
        <div className="left-bar__buttons--top">
          <LogoIcon
            className="logo-icon"
            onClick={() => navigate("/TravelMap/")}
          />
        </div>
        <div className="left-bar__buttons">
          <Link
            to={
              isVisited
                ? "/"
                : isFuture
                  ? "/TravelMap/?to=visited"
                  : "/TravelMap/visited"
            }
          >
            <Button
              className={`left-bar__button ${isVisited ? "left-bar__button--visited--active" : ""}`}
            >
              <VisitedIcon />
            </Button>
          </Link>
          <Link
            to={
              isFuture
                ? "/"
                : isVisited
                  ? "/TravelMap/?to=future"
                  : "/TravelMap/future"
            }
          >
            <Button
              className={`left-bar__button ${isFuture ? "left-bar__button--future--active" : ""}`}
            >
              <FutureTravelsIcon />
            </Button>
          </Link>
        </div>

        <div className="left-bar__buttons--bottom">
          <LanguageSelctor />
          <DarkModeButton
            isDarkTheme={isDarkTheme}
            handleDarkModeSwitch={handleDarkModeSwitch}
          />
        </div>
      </div>
    </div>
  );
});
