import "./EmptyState.scss";

import { ReactNode } from "react";

/**
 * Properties accepted by the EmptyState component.
 * @property {string} message - The message to display
 * @property {string} [hint] - A second line saying how the panel gets filled
 */
interface EmptyStateProps {
  message: string;
  hint?: string;
}

/**
 * EmptyState component
 * Placeholder shown in place of a panel's content when its underlying dataset
 * has nothing to show yet. An optional hint carries the follow-up a reader
 * needs, so an empty panel explains itself rather than merely reporting.
 * @component
 * @param {EmptyStateProps} props - The empty state props
 * @param {string} props.message - The message to display
 * @param {string} [props.hint] - A second line saying how the panel gets filled
 * @returns {ReactNode} The empty-state message
 */
export function EmptyState({ message, hint }: EmptyStateProps): ReactNode {
  return (
    <div className="empty-state">
      <p className="empty-state__message">{message}</p>
      {hint ? <p className="empty-state__hint">{hint}</p> : null}
    </div>
  );
}
