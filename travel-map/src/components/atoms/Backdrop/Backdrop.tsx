import "./Backdrop.scss";

interface BackdropProps {
  onClick?: () => void;
  isVisible?: boolean;
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
 * @returns {JSX.Element} - The backdrop
 */
export default function Backdrop({
  onClick,
  isVisible = true,
}: BackdropProps): JSX.Element {
  return (
    <div
      className={`backdrop ${onClick ? "backdrop--clickable" : ""} ${
        isVisible ? "backdrop--visible" : ""
      }`}
      onClick={onClick}
    />
  );
}
