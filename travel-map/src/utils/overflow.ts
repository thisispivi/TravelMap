import { RefObject } from "react";

/**
 * Checks if a component has overflow.
 * @param {RefObject<HTMLElement>} ref - The component reference.
 * @param {"vertical" | "horizontal" | "both"} [mode="vertical"] - The overflow mode.
 * @returns {boolean} Whether the component has overflow.
 */
export function componentHasOverflow(
  ref: RefObject<HTMLElement>,
  mode: "vertical" | "horizontal" | "both" = "vertical",
): boolean {
  if (ref.current) {
    if (mode === "both") {
      return (
        ref.current.scrollHeight > ref.current.clientHeight ||
        ref.current.scrollWidth > ref.current.clientWidth
      );
    }
    if (mode === "vertical") {
      return ref.current.scrollHeight > ref.current.clientHeight;
    } else if (mode === "horizontal") {
      return ref.current.scrollWidth > ref.current.clientWidth;
    }
  }
  return false;
}
