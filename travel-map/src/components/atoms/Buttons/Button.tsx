import "./Button.scss";

import { JSX, MouseEventHandler, PropsWithChildren } from "react";

export interface ButtonProps extends PropsWithChildren {
  className?: string;
  onClick?: MouseEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
  ariaLabel?: string;
  tooltipId?: string;
  tooltipContent?: string;
}

/**
 * A button
 *
 * The button component is used to create a button.
 *
 * @component
 *
 * @param {ButtonProps} props - The props of the component
 * @param {string} props.className - The class to apply to the button
 * @param {() => void} props.onClick - Function to call when the button is clicked
 * @param {() => void} props.onMouseEnter - Function to call when the mouse enters the button
 * @param {() => void} props.onMouseLeave - Function to call when the mouse leaves the button
 * @param {string} props.ariaLabel - The aria label of the button
 * @param {string} props.tooltipId - The id of the tooltip
 * @param {string} props.tooltipContent - The content of the tooltip
 * @param {React.ReactNode} props.children - The content of the button
 * @returns {JSX.Element} - The button
 */
export function Button({
  onClick,
  className = "",
  children,
  ariaLabel,
  tooltipContent,
  tooltipId,
  onMouseEnter,
  onMouseLeave,
}: ButtonProps): JSX.Element {
  return (
    <button
      aria-label={ariaLabel}
      className={`button ${className}`}
      data-tooltip-content={tooltipContent}
      data-tooltip-id={tooltipId}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      type="button"
    >
      {children}
    </button>
  );
}
