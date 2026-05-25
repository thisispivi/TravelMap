import "./Card.scss";

import { JSX, PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  className?: string;
}

/**
 * Card component
 *
 * Base card container for framed content.
 *
 * @component
 *
 * @param {CardProps} props - The card props
 * @param {string} [props.className] - Additional class names
 * @param {React.ReactNode} props.children - Card content
 * @returns {JSX.Element} The card
 */
export function Card({ className = "", children }: CardProps): JSX.Element {
  return <div className={`card ${className}`}>{children}</div>;
}
