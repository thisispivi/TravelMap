import { CloseIcon } from "../../../assets";
import "./CloseButton.scss";
import { JSX } from "react";

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * CloseButton component
 *
 * The close button component is used to display a close button.
 *
 * @component
 *
 * @param {CloseButtonProps} props - The props of the close button
 * @param {() => void} props.onClick - The function to call when the button is clicked
 * @param {string} [props.className] - The class name of the button
 *
 * @returns {JSX.Element} - The close button
 */
export default function CloseButton({
  onClick,
  className = "",
}: CloseButtonProps): JSX.Element {
  return (
    <CloseIcon className={`close-button ${className}`} onClick={onClick} />
  );
}
