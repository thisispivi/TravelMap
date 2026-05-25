import "./Row.scss";

import { JSX, PropsWithChildren } from "react";

interface RowProps extends PropsWithChildren {
  className?: string;
}

/**
 * Row component
 *
 * Generic horizontal flex container used as a layout primitive across the app.
 *
 * @component
 *
 * @param {RowProps} props - The props of the row
 * @param {string} [props.className] - Additional class names
 * @param {React.ReactNode} props.children - Row content
 * @returns {JSX.Element} The row container
 */
export function Row({ className = "", children }: RowProps): JSX.Element {
  return <div className={`row ${className}`}>{children}</div>;
}
