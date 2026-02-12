import { JSX } from "react";

import { PositionIcon } from "@/assets";
import { useLanguage } from "@/hooks/language/language";
import { ResponsiveType } from "@/hooks/style/responsive";
import { mobileAndTabletCheck } from "@/utils/responsive";

import { Button } from "..";
import { ButtonProps } from "./Button";

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
export function PositionButton({
  isAutoPosition,
  setIsAutoPosition,
  responsive,
}: PositionButtonProps): JSX.Element | null {
  const { t } = useLanguage(["home"]);
  if (mobileAndTabletCheck() || responsive.window.width <= 460) return null;
  return (
    <Button
      ariaLabel={t("autoPositionTooltip")}
      className={`position-button ${isAutoPosition ? "position-button--auto-position" : ""}`}
      onClick={() => setIsAutoPosition(!isAutoPosition)}
      tooltipContent={t("autoPositionTooltip")}
      tooltipId="base-tooltip"
    >
      <PositionIcon />
    </Button>
  );
}
