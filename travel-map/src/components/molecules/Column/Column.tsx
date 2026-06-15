import "./Column.scss";

import { PropsWithChildren, ReactNode } from "react";

interface ColumnProps extends PropsWithChildren {
  className?: string;
}

/**
 * Column component
 *
 * Generic vertical flex container.
 *
 * @component
 *
 * @param {ColumnProps} props - The column props
 * @param {string} [props.className] - Additional class names
 * @param {React.ReactNode} props.children - Column content
 * @returns {ReactNode} The column
 */
export function Column({ className = "", children }: ColumnProps): ReactNode {
  return <div className={`column ${className}`}>{children}</div>;
}
