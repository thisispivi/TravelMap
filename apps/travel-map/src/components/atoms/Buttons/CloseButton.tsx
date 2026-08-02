import "./CloseButton.scss";

import { ReactNode } from "react";

import CloseIcon from "@/assets/icons/Close.svg?react";

/**
 * Properties accepted by the CloseButton component.
 * @property {() => void} onClick - The on click
 * @property {string} ariaLabel - The accessible label
 * @property {string} [className] - The class name
 */
interface CloseButtonProps {
  onClick: () => void;
  ariaLabel: string;
  className?: string;
}

/**
 * CloseButton component
 * Icon-only close action, rendered as a native button for keyboard and
 * screen-reader access.
 * @component
 * @param {CloseButtonProps} props - The close button props
 * @param {() => void} props.onClick - Click handler
 * @param {string} props.ariaLabel - Accessible label for the button
 * @param {string} [props.className=""] - Additional class names
 * @returns {ReactNode} The close button
 */
export function CloseButton({
  onClick,
  ariaLabel,
  className = "",
}: CloseButtonProps): ReactNode {
  return (
    <button
      aria-label={ariaLabel}
      className={`close-button ${className}`}
      onClick={onClick}
      type="button"
    >
      <CloseIcon />
    </button>
  );
}
