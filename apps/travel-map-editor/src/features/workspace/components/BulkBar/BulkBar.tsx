import "./BulkBar.scss";

import { TransportModeIcon } from "@app/shared/components/TransportModeIcon/TransportModeIcon";
import { useLanguage } from "@app/shared/hooks/useLanguage";
import { TransportMode } from "@travelmap/core";
import { ReactNode } from "react";

import { transportModes } from "../../../../data/dataset";

/**
 * BulkBar component
 * Appears only while several steps are picked, and offers the operations that
 * are tedious one at a time: setting a mode across legs, moving a run of days,
 * and deleting a stretch of the itinerary. Every action is one undo step.
 * @component
 * @param {BulkBarProps} props
 * @param {number} props.count - How many steps are picked
 * @param {() => void} props.onClear - Clears the selection
 * @param {() => void} props.onDelete - Removes every picked step
 * @param {(mode: TransportMode) => void} props.onSetMode - Sets the mode on picked legs
 * @param {(days: number) => void} props.onShift - Moves picked steps in time
 * @returns {ReactNode} The bulk action bar
 */
export function BulkBar({
  count,
  onClear,
  onDelete,
  onSetMode,
  onShift,
}: BulkBarProps): ReactNode {
  const { t } = useLanguage(["editor"]);
  return (
    <div aria-live="polite" className="bulk-bar" role="toolbar">
      <span className="bulk-bar__count">{t("bulk.selected", { count })}</span>
      <span className="bulk-bar__group">
        <span className="bulk-bar__label">{t("bulk.setMode")}</span>
        {transportModes.map((mode) => (
          <button
            aria-label={t(`transportMode.${mode}`)}
            className="bulk-bar__mode"
            key={mode}
            onClick={() => onSetMode(mode)}
            type="button"
          >
            <TransportModeIcon mode={mode} />
          </button>
        ))}
      </span>
      <span className="bulk-bar__group">
        <span className="bulk-bar__label">{t("bulk.shift")}</span>
        <button
          className="editor-button"
          onClick={() => onShift(-1)}
          type="button"
        >
          −1d
        </button>
        <button
          className="editor-button"
          onClick={() => onShift(1)}
          type="button"
        >
          +1d
        </button>
        <button
          className="editor-button"
          onClick={() => onShift(7)}
          type="button"
        >
          +7d
        </button>
      </span>
      <button
        className="editor-button editor-button--danger"
        onClick={onDelete}
        type="button"
      >
        {t("bulk.delete")}
      </button>
      <button className="editor-button" onClick={onClear} type="button">
        {t("bulk.clear")}
      </button>
    </div>
  );
}

/**
 * Props for BulkBar.
 * @property {number} count - How many steps are picked
 * @property {() => void} onClear - Clears the selection
 * @property {() => void} onDelete - Removes every picked step
 * @property {(mode: TransportMode) => void} onSetMode - Sets the mode on picked legs
 * @property {(days: number) => void} onShift - Moves picked steps in time
 */
interface BulkBarProps {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  onSetMode: (mode: TransportMode) => void;
  onShift: (days: number) => void;
}
