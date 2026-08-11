import { createContext, use } from "react";

/**
 * Visibility contract for route-driven map panels.
 * @property {boolean} isPanelOpen - Whether the active panel is visible
 * @property {(isOpen: boolean) => void} setIsPanelOpen - Updates panel visibility
 */
export interface PanelContextValue {
  isPanelOpen: boolean;
  setIsPanelOpen: (isOpen: boolean) => void;
}

/** Panel visibility context provided by the map shell. */
export const PanelContext = createContext<PanelContextValue | null>(null);

/**
 * Reads panel visibility state from the persistent shell.
 * @returns {PanelContextValue} The active panel contract
 */
export function usePanel(): PanelContextValue {
  const value = use(PanelContext);

  if (!value) {
    throw new Error("usePanel must be used within PanelContext");
  }

  return value;
}
