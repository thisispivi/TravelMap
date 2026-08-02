import "./EmptyState.scss";

import { ReactNode } from "react";

/**
 * Properties accepted by the EmptyState component.
 * @property {string} message - The message to display
 */
interface EmptyStateProps {
  message: string;
}

/**
 * EmptyState component
 * Italicized placeholder shown in place of a panel's content when its
 * underlying dataset has nothing to show yet.
 * @component
 * @param {EmptyStateProps} props - The empty state props
 * @param {string} props.message - The message to display
 * @returns {ReactNode} The empty-state message
 */
export function EmptyState({ message }: EmptyStateProps): ReactNode {
  return <p className="empty-state">{message}</p>;
}
