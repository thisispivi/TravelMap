import { JSX, useMemo } from "react";
import {
  FutureTravelsIcon,
  HomeIcon,
  LogoIcon,
  StatsIcon,
  VisitedIcon,
} from "@/assets";
import { NavigableButton, DarkModeButton } from "../../atoms";
import "./LeftBar.scss";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/hooks/location/location";
import { LanguageSelector } from "..";
import { useTranslation } from "react-i18next";
import { HomeContextType } from "@/components/pages/Home/Home";

interface LeftBarProps {
  className?: string;
  isDarkTheme: HomeContextType["isDarkTheme"];
  handleDarkModeSwitch: HomeContextType["handleDarkModeSwitch"];
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
 * @param {boolean} props.isDarkTheme - The dark theme
 * @param {() => void} props.handleDarkModeSwitch - The function to call when the dark mode switch is clicked
 * @returns {JSX.Element} - The left bar
 */
export function LeftBar({
  className = "",
  isDarkTheme,
  handleDarkModeSwitch,
}: LeftBarProps): JSX.Element {
  const navigate = useNavigate();
  const { isGallery, isCurrentTabOpen } = useLocation();
  const { t } = useTranslation("home");

  const tabs = useMemo(() => ["lived", "visited", "future", "stats"], []);
  const buttonsConfig = useMemo(() => {
    return tabs.map((id) => ({
      id,
      isButtonActive: isCurrentTabOpen(id),
      defaultPath: `/${id}`,
      isOtherButtonsActive: tabs
        .filter((tab) => tab !== id)
        .some(isCurrentTabOpen),
      alternativePath: `/?to=${id}`,
      icon:
        id === "lived" ? (
          <HomeIcon />
        ) : id === "visited" ? (
          <VisitedIcon />
        ) : id === "future" ? (
          <FutureTravelsIcon />
        ) : (
          <StatsIcon />
        ),
      tooltipText: t(`${id}.title`),
      activeClass: `left-bar__button--${id}--active`,
      className: `left-bar__button--${id}`,
    }));
  }, [isCurrentTabOpen, t, tabs]);

  return (
    <div
      className={`left-bar ${className} ${isGallery ? "left-bar--close" : ""}`}
    >
      <div className="left-bar__container">
        <div className="left-bar__buttons--top">
          <LogoIcon
            className="logo-icon"
            data-tooltip-content={t("home")}
            data-tooltip-id="base-tooltip"
            onClick={() => navigate("/")}
          />
        </div>
        <div className="left-bar__buttons">
          {buttonsConfig.map((data) => (
            <NavigableButton key={`navigable-button-${data.id}`} {...data} />
          ))}
        </div>
        <div className="left-bar__buttons--bottom">
          <LanguageSelector />
          <DarkModeButton
            handleDarkModeSwitch={handleDarkModeSwitch}
            isDarkTheme={isDarkTheme}
          />
        </div>
      </div>
    </div>
  );
}
