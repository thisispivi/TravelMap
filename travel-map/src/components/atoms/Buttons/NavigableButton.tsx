import { JSX } from "react";
import { Link } from "react-router-dom";

import { Button } from "./Button";

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

/**
 * NavigableButton component
 *
 * The navigable button component is used to display a navigable button.
 *
 * @component
 *
 * @param {NavigableButtonProps} props - The props of the navigable button
 * @param {string} props.id - The id of the button
 * @param {boolean} props.isButtonActive - Whether the button is active
 * @param {string} props.defaultPath - The default path of the button
 * @param {boolean} props.isOtherButtonsActive - Whether other buttons are active
 * @param {string} props.alternativePath - The alternative path of the button
 * @param {JSX.Element} props.icon - The icon of the button
 * @param {string} props.className - The class name of the button
 * @param {string} props.activeClass - The class
 * @param {string} props.tooltipText - The tooltip text of the button
 * @returns {JSX.Element} - The navigable button
 */
export function NavigableButton({
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
}
