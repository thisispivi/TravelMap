import { PropsWithChildren, JSX } from "react";
import "./Column.scss";

interface ColumnProps extends PropsWithChildren {
  className?: string;
}

/**
 * Column component
 *
 * The column component is used to display column.
 *
 * @component
 *
 * @param {ColumnProps} props - The props of the column
 * @param {string} [props.className] - The class to apply to the column
 * @returns {JSX.Element} - The column
 */
export default function Column({
  className = "",
  children,
}: ColumnProps): JSX.Element {
  return <div className={`column ${className}`}>{children}</div>;
}
