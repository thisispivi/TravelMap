import "./CloseButton.scss";

import { JSX } from "react";

import { CloseIcon } from "../../../assets";

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * CloseButton component
 *
 * Icon-only close action.
 *
 * @component
 *
 * @param {CloseButtonProps} props - The close button props
 * @param {() => void} props.onClick - Click handler
 * @param {string} [props.className] - Additional class names
 * @returns {JSX.Element} The close button
 */
export function CloseButton({
  onClick,
  className = "",
}: CloseButtonProps): JSX.Element {
  return (
    <CloseIcon className={`close-button ${className}`} onClick={onClick} />
  );
}
