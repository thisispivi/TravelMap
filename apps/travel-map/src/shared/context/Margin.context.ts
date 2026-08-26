import { createContext, use } from "react";

/**
 * Visibility contract for the spread's reading margin. Collapsing it hands the
 * whole viewport to the plate, which is the only reason a reader ever wants the
 * column out of the way.
 * @property {boolean} isMarginOpen - Whether the reading column is expanded
 * @property {(isOpen: boolean) => void} setIsMarginOpen - Updates margin visibility
 */
export interface MarginContextValue {
  isMarginOpen: boolean;
  setIsMarginOpen: (isOpen: boolean) => void;
}

/** Margin visibility context provided by the application shell. */
export const MarginContext = createContext<MarginContextValue | null>(null);

/**
 * Reads margin visibility state from the persistent shell.
 * @returns {MarginContextValue} The active margin contract
 */
export function useMargin(): MarginContextValue {
  const value = use(MarginContext);

  if (!value) {
    throw new Error("useMargin must be used within MarginContext");
  }

  return value;
}
