import { useState } from "react";

import { applyDesign, Design, readStoredDesign } from "@/shared/lib/design";

/**
 * Design state returned by `useDesign`.
 * @property {Design} design - The active visual design
 * @property {(design: Design) => void} setDesign - Switches the visual design
 */
export interface UseDesignReturn {
  design: Design;
  setDesign: (design: Design) => void;
}

/**
 * Holds the active visual design, starting from the one `main.tsx` already
 * applied. A switch restyles the document before the state update, so the
 * render that follows reads the new design's tokens.
 * @returns {UseDesignReturn} The active design and its setter
 */
export function useDesign(): UseDesignReturn {
  const [design, setDesignState] = useState(readStoredDesign);

  /**
   * Applies a design to the document, then re-renders with it.
   * @param {Design} next - The design to switch to
   * @returns {void}
   */
  const setDesign = (next: Design): void => {
    applyDesign(next);
    setDesignState(next);
  };

  return { design, setDesign };
}
