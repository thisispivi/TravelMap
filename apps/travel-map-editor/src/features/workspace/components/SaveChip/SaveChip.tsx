import "./SaveChip.scss";

import { useLanguage } from "@app/shared/hooks/useLanguage";
import { classNames } from "@app/shared/lib/classNames";
import { ReactNode } from "react";

import { SaveState } from "../../../../shared/hooks/useAutosave";

/**
 * SaveChip component
 * Replaces the save button. Authors trust an explicit save, so removing one
 * only works if the editor says plainly where the document stands, and offers
 * a retry rather than silence when a write fails.
 * @component
 * @param {SaveChipProps} props
 * @param {string | null} props.error - Why the last write failed
 * @param {() => void} props.onRetry - Retries after a failure
 * @param {Date | null} props.savedAt - When the last write completed
 * @param {SaveState} props.state - Where the document stands
 * @returns {ReactNode} The save state chip
 */
export function SaveChip({
  error,
  onRetry,
  savedAt,
  state,
}: SaveChipProps): ReactNode {
  const { t } = useLanguage(["editor"]);

  if (state === "failed")
    return (
      <span className="save-chip save-chip--failed">
        <span className="save-chip__label" role="alert">
          {error ?? t("save.failed")}
        </span>
        <button className="editor-button" onClick={onRetry} type="button">
          {t("save.retry")}
        </button>
      </span>
    );
  return (
    <span
      aria-live="polite"
      className={classNames("save-chip", `save-chip--${state}`)}
    >
      {state === "saving" ? t("save.saving") : null}
      {state === "pending" ? t("save.pending") : null}
      {state === "saved" && savedAt
        ? t("save.savedAt", { time: savedAt.toLocaleTimeString() })
        : null}
      {state === "idle" ? t("save.upToDate") : null}
    </span>
  );
}

/**
 * Props for SaveChip.
 * @property {string | null} error - Why the last write failed
 * @property {() => void} onRetry - Retries after a failure
 * @property {Date | null} savedAt - When the last write completed
 * @property {SaveState} state - Where the document stands
 */
interface SaveChipProps {
  error: string | null;
  onRetry: () => void;
  savedAt: Date | null;
  state: SaveState;
}
