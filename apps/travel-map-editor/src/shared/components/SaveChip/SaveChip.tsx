import "./SaveChip.scss";

import { Button } from "@travelmap/ui/components/Button/Button";
import { useLanguage } from "@travelmap/ui/hooks/useLanguage";
import { classNames } from "@travelmap/ui/lib/classNames";
import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { ReactNode } from "react";

import { SaveState } from "../../context/SaveStatus.context";

/**
 * SaveChip component
 * Reports autosave progress and exposes a retry action after write failures.
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
  const { currLanguage, t } = useLanguage(["editor"]);

  if (state === "failed")
    return (
      <span className="save-chip save-chip--failed">
        <span className="save-chip__label" role="alert">
          <CircleAlert aria-hidden="true" />
          {error ?? t("save.failed")}
        </span>
        <Button onClick={onRetry}>{t("save.retry")}</Button>
      </span>
    );
  return (
    <span
      aria-live="polite"
      className={classNames("save-chip", `save-chip--${state}`)}
    >
      {state === "saving" || state === "pending" ? (
        <LoaderCircle aria-hidden="true" className="save-chip__spinner" />
      ) : (
        <Check aria-hidden="true" />
      )}
      {state === "saving" ? t("save.saving") : null}
      {state === "pending" ? t("save.pending") : null}
      {state === "saved" && savedAt
        ? t("save.savedAt", {
            time: savedAt.toLocaleTimeString(currLanguage, {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })
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
