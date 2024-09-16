import { PropsWithChildren } from "react";
import "./Card.scss";

interface CardProps extends PropsWithChildren {
  className?: string;
}

/**
 * Card component
 *
 * The card component is used to display a card with a shadow.
 *
 * @component
 *
 * @param {CardProps} props - The props of the card
 * @param {string} [props.className] - The class to apply to the card
 * @returns {JSX.Element} - The card
 */
export default function Card({
  className = "",
  children,
}: CardProps): JSX.Element {
  return <div className={`card ${className}`}>{children}</div>;
}
