import "./Backdrop.scss";

import { JSX } from "react";

interface BackdropProps {
  onClick?: () => void;
  isVisible?: boolean;
  className?: string;
}

/**
 * Backdrop component
 *
 * The backdrop component is used to display a backdrop.
 *
 * @component
 *
 * @param {BackdropProps} props - The props of the component
 * @param {() => void} [props.onClick] - The function to call on click
 * @param {boolean} [props.isVisible=true] - The visibility of the backdrop
 * @param {string} [props.className] - The class to apply to
 * @returns {JSX.Element} - The backdrop
 */
export function Backdrop({
  onClick,
  isVisible = true,
  className = "",
}: BackdropProps): JSX.Element {
  return (
    <div
      className={`backdrop  ${isVisible ? "backdrop--visible" : ""} ${className}
      `}
      onClick={onClick}
    />
  );
}
