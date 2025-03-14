import useLanguage from "@/hooks/language/language";
import { Button } from "..";
import { PositionIcon } from "@/assets";
import { mobileAndTabletCheck } from "@/utils/responsive";
import { ButtonProps } from "./Button";
import { ResponsiveType } from "@/hooks/style/responsive";
import { JSX, memo } from "react";

interface PositionButtonProps extends ButtonProps {
  isAutoPosition: boolean;
  setIsAutoPosition: (isAutoPosition: boolean) => void;
  responsive: ResponsiveType;
}

/**
 * PositionButton component
 *
 * The position button component is used to display the position button.
 *
 * @component
 *
 * @param {PositionButtonProps} props - The props of the position button
 * @param {boolean} props.isAutoPosition - The auto position state
 * @param {(isAutoPosition: boolean) => void} props.setIsAutoPosition - The function to call when the auto position changes
 * @param {ResponsiveType} props.responsive - The responsive
 * @returns {JSX.Element} - The position button
 */
const PositionButton = ({
  isAutoPosition,
  setIsAutoPosition,
  responsive,
}: PositionButtonProps): JSX.Element | null => {
  const { t } = useLanguage(["home"]);
  if (mobileAndTabletCheck() || responsive.window.width <= 460) return null;
  return (
    <Button
      ariaLabel={t("autoPositionTooltip")}
      className={`info-tab-cities__position-button ${
        isAutoPosition ? "info-tab-cities__position-button--auto-position" : ""
      }`}
      data-tooltip-content={t("autoPositionTooltip")}
      data-tooltip-id="base-tooltip"
      onClick={() => setIsAutoPosition(!isAutoPosition)}
    >
      <PositionIcon />
    </Button>
  );
};

export default memo(PositionButton);
