import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useState,
} from "react";

/** Where a document stands between the last edit and the last successful write. */
export type SaveState = "idle" | "pending" | "saving" | "saved" | "failed";

/**
 * Autosave status for one document, and the retry its failures need.
 * @property {string | null} error - Why the last write failed, when it did
 * @property {() => void} retry - Retries after a failure
 * @property {Date | null} savedAt - When the last successful write completed
 * @property {SaveState} state - Where the document stands
 */
export interface SaveStatus {
  error: string | null;
  retry: () => void;
  savedAt: Date | null;
  state: SaveState;
}

/**
 * The published status and the setter every autosaving screen writes through.
 * @property {SaveStatus | null} status - Status of the screen on show, or null when nothing is editable
 * @property {(status: SaveStatus | null) => void} setStatus - Publishes or clears the status
 */
interface SaveStatusValue {
  status: SaveStatus | null;
  setStatus: (status: SaveStatus | null) => void;
}

const SaveStatusContext = createContext<SaveStatusValue | null>(null);

/**
 * SaveStatusProvider component
 * Lifts autosave status out of the screen that owns it so the navigation can
 * report it once, instead of every screen repeating a chip in its own header.
 * @component
 * @param {PropsWithChildren} props
 * @param {ReactNode} props.children - The editor tree
 * @returns {ReactNode} The provider
 */
export function SaveStatusProvider({ children }: PropsWithChildren): ReactNode {
  const [status, setStatus] = useState<SaveStatus | null>(null);
  return (
    <SaveStatusContext.Provider value={{ setStatus, status }}>
      {children}
    </SaveStatusContext.Provider>
  );
}

/**
 * Reads the published autosave status and its setter.
 * @returns {SaveStatusValue} The status and its setter
 */
export function useSaveStatus(): SaveStatusValue {
  const value = useContext(SaveStatusContext);
  if (!value) {
    throw new Error("useSaveStatus must be used inside a SaveStatusProvider.");
  }
  return value;
}
