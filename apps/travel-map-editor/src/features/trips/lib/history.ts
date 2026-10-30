/**
 * An undo stack over whole snapshots of one document.
 * Documents here are a few kilobytes of JSON, so snapshotting is far simpler
 * than patch algebra and costs nothing that matters at this size.
 * @property {T[]} past - Older snapshots, oldest first
 * @property {T} present - The current snapshot
 * @property {T[]} future - Undone snapshots, nearest first
 */
export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

/* Two hundred snapshots of a trip is well under a megabyte. */
const HISTORY_LIMIT = 200;

/**
 * Starts a history at one snapshot.
 * @param {T} present - The initial snapshot
 * @returns {History<T>} A history with nothing to undo
 */
export function createHistory<T>(present: T): History<T> {
  return { future: [], past: [], present };
}

/**
 * Records a new snapshot, dropping anything that had been undone.
 * `isMergeable` folds the change into the previous entry, which is what keeps
 * typing a title from producing one undo step per keystroke.
 * @param {History<T>} history - The current history
 * @param {T} next - The new snapshot
 * @param {boolean} [isMergeable] - Whether to replace the last entry instead
 * @returns {History<T>} The updated history
 */
export function commit<T>(
  history: History<T>,
  next: T,
  isMergeable = false,
): History<T> {
  if (isMergeable && history.past.length > 0)
    return { future: [], past: history.past, present: next };
  return {
    future: [],
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: next,
  };
}

/**
 * Steps one snapshot backwards.
 * @param {History<T>} history - The current history
 * @returns {History<T>} The updated history, unchanged when nothing to undo
 */
export function undo<T>(history: History<T>): History<T> {
  const previous = history.past.at(-1);
  if (previous === undefined) return history;
  return {
    future: [history.present, ...history.future],
    past: history.past.slice(0, -1),
    present: previous,
  };
}

/**
 * Steps one snapshot forwards.
 * @param {History<T>} history - The current history
 * @returns {History<T>} The updated history, unchanged when nothing to redo
 */
export function redo<T>(history: History<T>): History<T> {
  const [next, ...rest] = history.future;
  if (next === undefined) return history;
  return {
    future: rest,
    past: [...history.past, history.present],
    present: next,
  };
}
