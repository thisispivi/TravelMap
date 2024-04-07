import { MouseEventHandler, PropsWithChildren } from "react";
import "./Button.scss";

interface ButtonProps extends PropsWithChildren {
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
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
 * @param {React.ReactNode} props.children - The content of the button
 * @returns {JSX.Element} - The button
 */
export default function Button({
  onClick,
  className = "",
  children,
}: ButtonProps): JSX.Element {
  return (
    <button className={`button ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
