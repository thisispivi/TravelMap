import { Issue, TripJson, validateTrip } from "@travelmap/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import { photoKeys } from "../../data/dataset";
import { DataFile, saveDocument } from "../../data/store";
import { SaveState, useAutosave } from "../../shared/hooks/useAutosave";
import { useDataset } from "../../shared/hooks/useDataset";
import { commit, createHistory, redo, undo } from "../history/lib/history";

/** What the rail, the map, and the inspector are all currently pointed at. */
export type Selection =
  | { kind: "trip" }
  | { kind: "step"; index: number }
  | { kind: "day"; date: string | null };

/**
 * A draft found in local storage that is newer than the file on disk.
 * @property {string} savedAt - When the draft was captured
 * @property {TripJson} value - The recovered trip
 */
export interface RecoveredDraft {
  savedAt: string;
  value: TripJson;
}

/**
 * Everything one trip workspace needs, as one contract.
 * @property {TripJson} trip - The working draft
 * @property {Issue[]} issues - Live validation for the draft
 * @property {Selection} selection - What every pane is pointed at
 * @property {(selection: Selection) => void} select - Moves the selection
 * @property {(next: TripJson, isMergeable?: boolean) => void} update - Commits an edit
 * @property {() => void} undoEdit - Steps one edit backwards
 * @property {() => void} redoEdit - Steps one edit forwards
 * @property {boolean} canUndo - Whether there is anything to undo
 * @property {boolean} canRedo - Whether there is anything to redo
 * @property {SaveState} saveState - Where the document stands
 * @property {Date | null} savedAt - When the last write completed
 * @property {string | null} saveError - Why the last write failed
 * @property {() => void} retrySave - Retries after a failed write
 * @property {RecoveredDraft | null} recovered - An unsaved draft from a past session
 * @property {() => void} restoreRecovered - Adopts the recovered draft
 * @property {() => void} discardRecovered - Throws the recovered draft away
 */
export interface UseTripWorkspaceReturn {
  trip: TripJson;
  issues: Issue[];
  selection: Selection;
  select: (selection: Selection) => void;
  update: (next: TripJson, isMergeable?: boolean) => void;
  undoEdit: () => void;
  redoEdit: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveState: SaveState;
  savedAt: Date | null;
  saveError: string | null;
  retrySave: () => void;
  recovered: RecoveredDraft | null;
  restoreRecovered: () => void;
  discardRecovered: () => void;
}

const RECOVERY_PREFIX = "travelmap-editor:draft:";

/**
 * Reads a draft left behind by a session that ended before its last write.
 * @param {string} path - Dataset-relative path of the trip
 * @param {TripJson} onDisk - What the file currently holds
 * @returns {RecoveredDraft | null} The draft, when it differs from disk
 */
function readRecovered(path: string, onDisk: TripJson): RecoveredDraft | null {
  try {
    const raw = localStorage.getItem(`${RECOVERY_PREFIX}${path}`);
    if (!raw) return null;
    const draft = JSON.parse(raw) as RecoveredDraft;
    if (JSON.stringify(draft.value) === JSON.stringify(onDisk)) return null;
    return draft;
  } catch {
    /* A corrupt snapshot must never stop the editor from opening. */
    return null;
  }
}

/**
 * Encodes a selection compactly enough to live in a query string, so a
 * validation issue can be linked to rather than only described.
 * @param {Selection} selection - The selection to encode
 * @returns {string} The query value
 */
function encodeSelection(selection: Selection): string {
  if (selection.kind === "step") return `step:${selection.index}`;
  if (selection.kind === "day") return `day:${selection.date ?? ""}`;
  return "trip";
}

/**
 * Reads a selection back out of a query string.
 * @param {string | null} value - The query value
 * @returns {Selection} The decoded selection, defaulting to the trip
 */
function decodeSelection(value: string | null): Selection {
  if (!value) return { kind: "trip" };
  const [kind, rest = ""] = value.split(":");
  if (kind === "step" && rest !== "")
    return { index: Number(rest), kind: "step" };
  if (kind === "day") return { date: rest || null, kind: "day" };
  return { kind: "trip" };
}

/**
 * Owns one trip's draft, its history, its autosave, and its selection.
 * The draft is the single writer: the rail, the map, and the inspector all
 * render from it and all edit through `update`, which is what keeps the three
 * panes from drifting apart the way separate component state would.
 * @param {DataFile<TripJson>} file - The trip document being edited
 * @returns {UseTripWorkspaceReturn} The workspace contract
 */
export function useTripWorkspace(
  file: DataFile<TripJson>,
): UseTripWorkspaceReturn {
  const dataset = useDataset();
  const [searchParams, setSearchParams] = useSearchParams();
  const [history, setHistory] = useState(() => createHistory(file.value));
  const [recovered, setRecovered] = useState(() =>
    readRecovered(file.path, file.value),
  );

  const trip = history.present;
  const isDirty = JSON.stringify(trip) !== JSON.stringify(file.value);
  const selection = decodeSelection(searchParams.get("sel"));

  const save = useAutosave(
    trip,
    useCallback(
      async (value: TripJson) => saveDocument(file.path, value),
      [file.path],
    ),
    isDirty,
  );

  const cities = useMemo(
    () => new Map(dataset.cities.map(({ value }) => [value.id, value])),
    [dataset.cities],
  );
  const issues = useMemo(
    () =>
      validateTrip(
        trip,
        { cities, photoKeys: new Set(photoKeys(dataset)) },
        file.path,
      ),
    [cities, dataset, file.path, trip],
  );

  useEffect(() => {
    if (!isDirty) {
      localStorage.removeItem(`${RECOVERY_PREFIX}${file.path}`);
      return;
    }
    localStorage.setItem(
      `${RECOVERY_PREFIX}${file.path}`,
      JSON.stringify({ savedAt: new Date().toISOString(), value: trip }),
    );
  }, [file.path, isDirty, trip]);

  /**
   * Records an edit and, unless it merges, gives it its own undo step.
   * @param {TripJson} next - The edited trip
   * @param {boolean} [isMergeable] - Whether to fold it into the last step
   * @returns {void}
   */
  function update(next: TripJson, isMergeable = false): void {
    setHistory((current) => commit(current, next, isMergeable));
  }

  /**
   * Points every pane at something else, keeping it in the URL so the state
   * survives a refresh and can be shared.
   * @param {Selection} next - The new selection
   * @returns {void}
   */
  function select(next: Selection): void {
    setSearchParams(
      (params) => {
        const updated = new URLSearchParams(params);
        updated.set("sel", encodeSelection(next));
        return updated;
      },
      { replace: true },
    );
  }

  /**
   * Adopts the draft recovered from a previous session.
   * @returns {void}
   */
  function restoreRecovered(): void {
    if (!recovered) return;
    setHistory((current) => commit(current, recovered.value));
    setRecovered(null);
  }

  /**
   * Discards the recovered draft and keeps what is on disk.
   * @returns {void}
   */
  function discardRecovered(): void {
    localStorage.removeItem(`${RECOVERY_PREFIX}${file.path}`);
    setRecovered(null);
  }

  return {
    canRedo: history.future.length > 0,
    canUndo: history.past.length > 0,
    discardRecovered,
    issues,
    recovered,
    redoEdit: () => setHistory(redo),
    restoreRecovered,
    retrySave: save.retry,
    saveError: save.error,
    savedAt: save.savedAt,
    saveState: save.state,
    select,
    selection,
    trip,
    undoEdit: () => setHistory(undo),
    update,
  };
}
