import { FutureTravelsIcon, LogoIcon, VisitedIcon } from "../../../assets";
import { DarkModeButton } from "../../atoms";
import "./LeftBar.scss";
import { HomeContext } from "../../pages/Home/Home";
import { memo, useContext } from "react";
import Button from "../../atoms/Buttons/Button";
import { Link, useNavigate } from "react-router-dom";
import useLocation from "../../../hooks/location/location";
import { LanguageSelector, Tooltip } from "..";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("home");
  const context = useContext(HomeContext);
  const { isDarkTheme, handleDarkModeSwitch } = context!;
  return (
    <div
      className={`left-bar ${className} ${isGallery ? "left-bar--close" : ""}`}
    >
      <div className="left-bar__container">
        <div className="left-bar__buttons--top">
          <LogoIcon className="logo-icon" onClick={() => navigate("/")} />
          <Tooltip
            text={t("home")}
            anchorSelect=".logo-icon"
            delayShow={300}
            noArrow
          />
        </div>
        <div className="left-bar__buttons">
          <Link to={isVisited ? "/" : isFuture ? "/?to=visited" : "/visited"}>
            <Button
              className={`left-bar__button ${isVisited ? "left-bar__button--visited--active" : ""} left-bar__button--visited`}
            >
              <VisitedIcon />
            </Button>
            <Tooltip
              text={t("visited.title")}
              anchorSelect=".left-bar__button--visited"
              delayShow={300}
              noArrow
            />
          </Link>
          <Link to={isFuture ? "/" : isVisited ? "/?to=future" : "/future"}>
            <Button
              className={`left-bar__button ${isFuture ? "left-bar__button--future--active" : ""} left-bar__button--future`}
            >
              <FutureTravelsIcon />
            </Button>
            <Tooltip
              text={t("future.title")}
              anchorSelect=".left-bar__button--future"
              delayShow={300}
              noArrow
            />
          </Link>
        </div>
        <div className="left-bar__buttons--bottom">
          <LanguageSelector />
          <Tooltip
            text={t("language")}
            anchorSelect=".language-selector__activator"
            delayShow={300}
            noArrow
          />
          <DarkModeButton
            isDarkTheme={isDarkTheme}
            handleDarkModeSwitch={handleDarkModeSwitch}
          />
          <Tooltip
            text={t("theme")}
            anchorSelect=".dark-mode-button"
            delayShow={300}
            noArrow
          />
        </div>
      </div>
    </div>
  );
});
