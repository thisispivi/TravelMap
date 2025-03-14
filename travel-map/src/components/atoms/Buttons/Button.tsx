import { MouseEventHandler, PropsWithChildren, JSX } from "react";
import "./Button.scss";

export interface ButtonProps extends PropsWithChildren {
  className?: string;
  onClick?: MouseEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
  ariaLabel?: string;
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
 * @param {React.ReactNode} props.children - The content of the button
 * @returns {JSX.Element} - The button
 */
export default function Button({
  onClick,
  className = "",
  children,
  ariaLabel,
}: ButtonProps): JSX.Element {
  return (
    <button
      aria-label={ariaLabel}
      className={`button ${className}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
