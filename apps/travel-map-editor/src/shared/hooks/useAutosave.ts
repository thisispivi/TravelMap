import { useCallback, useEffect, useRef, useState } from "react";

/** Where a document stands between the last edit and the last successful write. */
export type SaveState = "idle" | "pending" | "saving" | "saved" | "failed";

/** The part of the save state a write actually decides. */
type WriteState = "idle" | "saving" | "saved" | "failed";

/**
 * Autosave status and controls for one document.
 * @property {SaveState} state - Where the document stands
 * @property {Date | null} savedAt - When the last successful write completed
 * @property {string | null} error - Why the last write failed, when it did
 * @property {() => void} retry - Retries after a failure
 */
export interface UseAutosaveReturn {
  state: SaveState;
  savedAt: Date | null;
  error: string | null;
  retry: () => void;
}

const AUTOSAVE_DELAY_MS = 800;

/**
 * Persists a value shortly after it stops changing, and immediately when the
 * tab is hidden so a closed laptop does not lose the last edit.
 * A failed write deliberately leaves the value in place rather than reverting:
 * discarding what the author just typed is worse than showing them a retry.
 * @param {T} value - The value to persist
 * @param {(value: T) => Promise<void>} save - Performs the write
 * @param {boolean} isDirty - Whether the value differs from what is on disk
 * @returns {UseAutosaveReturn} Autosave status and controls
 */
export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<void>,
  isDirty: boolean,
): UseAutosaveReturn {
  const [writeState, setWriteState] = useState<WriteState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const valueRef = useRef(value);
  const saveRef = useRef(save);
  const isWritingRef = useRef(false);

  /* The latest-value refs a timer callback cannot take as dependencies. */
  useEffect(() => {
    valueRef.current = value;
    saveRef.current = save;
  });

  const persist = useCallback(async (): Promise<void> => {
    if (isWritingRef.current) return;
    isWritingRef.current = true;
    setWriteState("saving");
    try {
      await saveRef.current(valueRef.current);
      setError(null);
      setSavedAt(new Date());
      setWriteState("saved");
    } catch (writeError) {
      setError(
        writeError instanceof Error
          ? writeError.message
          : "The editor could not write to disk.",
      );
      setWriteState("failed");
    } finally {
      isWritingRef.current = false;
    }
  }, []);

  /*
   * Rescheduling on every change is the debounce: a keystroke clears the
   * pending timer and starts a new one, so a burst of typing writes once.
   */
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => void persist(), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isDirty, persist, value]);

  useEffect(() => {
    /**
     * Writes without waiting for the debounce when the tab stops being visible.
     * @returns {void}
     */
    function handleVisibilityChange(): void {
      if (document.visibilityState === "hidden" && isDirty) void persist();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isDirty, persist]);

  /*
   * "Pending" is derived rather than stored: it is exactly "dirty and not
   * currently mid-write", so storing it would be a second copy of state the
   * component already has.
   */
  const state: SaveState =
    writeState === "saving" || writeState === "failed"
      ? writeState
      : isDirty
        ? "pending"
        : writeState;

  return { error, retry: () => void persist(), savedAt, state };
}
