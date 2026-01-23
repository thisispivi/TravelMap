import { PropsWithChildren, JSX } from "react";
import "./Row.scss";

interface Row extends PropsWithChildren {
  className?: string;
}

/**
 * Row component
 *
 * The row component is used to display a row.
 *
 * @component
 *
 * @param {Row} props - The props of the row
 * @param {string} [props.className] - The class to apply to the row
 * @returns {JSX.Element} - The row
 */
export function Row({ className = "", children }: Row): JSX.Element {
  return <div className={`row ${className}`}>{children}</div>;
}
