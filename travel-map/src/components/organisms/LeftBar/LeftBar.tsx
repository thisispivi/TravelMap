import {
  FutureTravelsIcon,
  LogoIcon,
  StatsIcon,
  VisitedIcon,
} from "../../../assets";
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
  const { isVisited, isFuture, isGallery, isStats } = useLocation();
  const { t } = useTranslation("home");
  const context = useContext(HomeContext);
  const { isDarkTheme, handleDarkModeSwitch } = context!;

  const buttonsConfig = [
    {
      id: "visited",
      isButtonActive: isVisited,
      defaultPath: "/visited",
      isOtherButtonsActive: isFuture || isStats,
      alternativePath: "/?to=visited",
      icon: <VisitedIcon />,
      tooltipText: t("visited.title"),
      activeClass: "left-bar__button--visited--active",
      className: "left-bar__button--visited",
    },
    {
      id: "future",
      isButtonActive: isFuture,
      defaultPath: "/future",
      isOtherButtonsActive: isVisited || isStats,
      alternativePath: "/?to=future",
      icon: <FutureTravelsIcon />,
      tooltipText: t("future.title"),
      activeClass: "left-bar__button--future--active",
      className: "left-bar__button--future",
    },
    {
      id: "stats",
      isButtonActive: isStats,
      defaultPath: "/stats",
      isOtherButtonsActive: isVisited || isFuture,
      alternativePath: "/?to=stats",
      icon: <StatsIcon />,
      tooltipText: t("stats.title"),
      activeClass: "left-bar__button--stats--active",
      className: "left-bar__button--stats",
    },
  ];

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
          {buttonsConfig.map(
            ({
              id,
              isButtonActive,
              defaultPath,
              isOtherButtonsActive,
              alternativePath,
              icon,
              tooltipText,
              activeClass,
              className,
            }) => (
              <Link
                to={
                  isButtonActive
                    ? "/"
                    : isOtherButtonsActive
                      ? alternativePath
                      : defaultPath
                }
                key={id}
              >
                <Button
                  className={`${className} ${isButtonActive ? activeClass : ""}`}
                >
                  {icon}
                </Button>
                <Tooltip
                  text={tooltipText}
                  anchorSelect={`.${className}`}
                  delayShow={300}
                  noArrow
                />
              </Link>
            )
          )}
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
