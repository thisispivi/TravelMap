import "./Card.scss";

import { ReactNode } from "react";

import { classNames } from "@/shared/lib/classNames";

/**
 * Properties accepted by the Card component.
 * @property {string} [className] - The class name
 * @property {ReactNode} children - The children
 */
interface CardProps {
  className?: string;
  children: ReactNode;
}

/**
 * Card component
 * Base card container for framed content.
 * @component
 * @param {CardProps} props - The card props
 * @param {string} [props.className=""] - Additional class names
 * @param {ReactNode} props.children - Card content
 * @returns {ReactNode} The card
 */
export function Card({ className = "", children }: CardProps): ReactNode {
  return <div className={classNames("card", className)}>{children}</div>;
}
