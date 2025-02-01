import { MouseEventHandler, PropsWithChildren, JSX } from "react";
import "./Button.scss";

interface ButtonProps extends PropsWithChildren {
  className?: string;
  onClick?: MouseEventHandler;
  onMouseEnter?: MouseEventHandler;
  onMouseLeave?: MouseEventHandler;
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
 * @param {React.ReactNode} props.children - The content of the button
 * @returns {JSX.Element} - The button
 */
export default function Button({
  onClick,
  className = "",
  children,
  onMouseEnter,
  onMouseLeave,
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`button ${className}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      type="button"
    >
      {children}
    </button>
  );
}
