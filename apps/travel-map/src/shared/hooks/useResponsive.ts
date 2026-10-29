import { useEffect, useState } from "react";

import variables from "@/styles/_variables.module.scss";

/*
 * The layout switches from rail + side panel to tab bar + bottom sheet at this
 * width. It is read from the stylesheet so CSS and the camera never disagree.
 */
const COMPACT_BREAKPOINT_PX =
  Number.parseFloat(variables.breakpointCompact) * 16;

/**
 * Viewport state returned by `useResponsive`.
 * @property {{ width: number; height: number }} window - The viewport size in CSS pixels
 * @property {boolean} isCompact - Whether the phone layout (tab bar, bottom sheet) is active
 */
export type ResponsiveType = {
  window: { width: number; height: number };
  isCompact: boolean;
};

/**
 * Reads the current viewport.
 * @returns {ResponsiveType} The viewport size and layout mode
 */
function readViewport(): ResponsiveType {
  return {
    window: { width: window.innerWidth, height: window.innerHeight },
    isCompact: window.innerWidth < COMPACT_BREAKPOINT_PX,
  };
}

/**
 * Tracks the viewport size and which layout it calls for.
 * @returns {ResponsiveType} The viewport size and layout mode
 */
export function useResponsive(): ResponsiveType {
  const [viewport, setViewport] = useState(readViewport);

  useEffect(() => {
    /**
     * Re-reads the viewport after a resize or rotation.
     * @returns {void}
     */
    const handleResize = (): void => setViewport(readViewport());

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return viewport;
}
