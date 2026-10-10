import { useEffect, useState } from "react";

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
 * Holds the active visual design, starting from the remembered one, and keeps
 * the document and localStorage in step with it.
 * @returns {UseDesignReturn} The active design and its setter
 */
export function useDesign(): UseDesignReturn {
  const [design, setDesign] = useState(readStoredDesign);

  useEffect(() => {
    applyDesign(design);
  }, [design]);

  return { design, setDesign };
}
