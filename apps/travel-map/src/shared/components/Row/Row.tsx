import "./Row.scss";

import { ReactNode } from "react";

/**
 * Properties accepted by the Row component.
 * @property {string} [className] - The class name
 * @property {ReactNode} children - The children
 */
interface RowProps {
  className?: string;
  children: ReactNode;
}

/**
 * Row component
 * Generic horizontal flex container used as a layout primitive across the app.
 * @component
 * @param {RowProps} props - The props of the row
 * @param {string} [props.className=""] - Additional class names
 * @param {ReactNode} props.children - Row content
 * @returns {ReactNode} The row container
 */
export function Row({ className = "", children }: RowProps): ReactNode {
  return <div className={`row ${className}`}>{children}</div>;
}
