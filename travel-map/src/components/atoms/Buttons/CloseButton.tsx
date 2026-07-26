import "./CloseButton.scss";

import { ReactNode } from "react";

import CloseIcon from "@/assets/icons/Close.svg?react";

/**
 * Properties accepted by the CloseButton component.
 * @property {() => void} onClick - The on click
 * @property {string} [className] - The class name
 */
interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * CloseButton component
 * Icon-only close action.
 * @component
 * @param {CloseButtonProps} props - The close button props
 * @param {() => void} props.onClick - Click handler
 * @param {string} [props.className=""] - Additional class names
 * @returns {ReactNode} The close button
 */
export function CloseButton({
  onClick,
  className = "",
}: CloseButtonProps): ReactNode {
  return (
    <CloseIcon className={`close-button ${className}`} onClick={onClick} />
  );
}
