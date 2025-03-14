import { JSX, memo } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";

interface NavigableButtonProps {
  id: string;
  isButtonActive: boolean;
  defaultPath: string;
  isOtherButtonsActive: boolean;
  alternativePath: string;
  icon: JSX.Element;
  className: string;
  activeClass: string;
  tooltipText: string;
}

export default memo(function NavigableButton({
  id,
  isButtonActive,
  defaultPath,
  isOtherButtonsActive,
  alternativePath,
  icon,
  className,
  activeClass,
  tooltipText,
}: NavigableButtonProps): JSX.Element {
  return (
    <Link
      data-tooltip-content={tooltipText}
      data-tooltip-id="base-tooltip"
      key={id}
      to={
        isButtonActive
          ? "/"
          : isOtherButtonsActive
            ? alternativePath
            : defaultPath
      }
    >
      <Button
        ariaLabel={tooltipText}
        className={`${className} ${isButtonActive ? activeClass : ""}`}
      >
        {icon}
      </Button>
    </Link>
  );
});
