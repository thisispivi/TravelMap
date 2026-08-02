import { RefObject, useLayoutEffect, useState } from "react";

/**
 * Where a floating menu should be drawn, in viewport coordinates.
 * @property {number} left - Distance from the viewport's left edge
 * @property {number} maxHeight - Space available before the viewport edge
 * @property {"top" | "bottom"} placement - Which side of the anchor the menu opens on
 * @property {number} top - Distance from the viewport's top edge
 * @property {number} width - The anchor's width, matched by the menu
 */
export interface MenuPosition {
  left: number;
  maxHeight: number;
  placement: "top" | "bottom";
  top: number;
  width: number;
}

const MENU_GAP_REM = 0.25;
const MENU_MAX_HEIGHT_REM = 18;
const REM_IN_PX = 16;

// Every panel anchored by useAnchoredMenu (a combobox's option list, the date
// picker's calendar) shares this open/close motion, so they read as one
// family of floating panel rather than each having drifted its own feel.
export const ANCHORED_PANEL_VARIANTS = {
  initial: { opacity: 0, scale: 0.98, y: -4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.14, ease: [0.4, 0, 0.2, 1] },
  },
  exit: { opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.1 } },
} as const;

/**
 * Measures an anchor and picks the side of it with more room.
 * @param {HTMLElement | null} anchor - The control the menu attaches to
 * @returns {MenuPosition | null} The position, when the anchor is mounted
 */
function measure(anchor: HTMLElement | null): MenuPosition | null {
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const gap = MENU_GAP_REM * REM_IN_PX;
  const maxHeight = MENU_MAX_HEIGHT_REM * REM_IN_PX;
  // The same gap is left against the viewport edge, so a menu opening near the
  // bottom stops short of it rather than sitting flush against it.
  const below = window.innerHeight - rect.bottom - gap * 2;
  const above = rect.top - gap * 2;
  const opensUp = below < maxHeight && above > below;

  return {
    left: rect.left,
    maxHeight: Math.max(0, Math.min(maxHeight, opensUp ? above : below)),
    placement: opensUp ? "top" : "bottom",
    top: opensUp ? rect.top - gap : rect.bottom + gap,
    width: rect.width,
  };
}

/**
 * Reports whether two positions differ enough to be worth re-rendering.
 * @param {MenuPosition | null} first - The current position
 * @param {MenuPosition | null} second - The freshly measured position
 * @returns {boolean} Whether the position changed
 */
function hasMoved(
  first: MenuPosition | null,
  second: MenuPosition | null,
): boolean {
  if (first === null || second === null) return first !== second;
  return (
    first.left !== second.left ||
    first.top !== second.top ||
    first.width !== second.width ||
    first.maxHeight !== second.maxHeight ||
    first.placement !== second.placement
  );
}

/**
 * Tracks where a dropdown attached to an anchor should be drawn.
 * Editor panels use backdrop filters, which create stacking contexts that trap
 * an absolutely positioned menu behind the next panel and clip it at the panel
 * edge. Menus are therefore portalled to the body and positioned here, against
 * the viewport, flipping above the anchor when there is more room there.
 * @param {RefObject<HTMLElement | null>} anchorRef - The control the menu attaches to
 * @param {boolean} isOpen - Whether the menu is currently shown
 * @returns {MenuPosition | null} The position, once the menu is open
 */
export function useAnchoredMenu(
  anchorRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
): MenuPosition | null {
  const [position, setPosition] = useState<MenuPosition | null>(null);

  // A layout effect, because the anchor can only be measured once the DOM that
  // opened the menu is committed, and this must happen before the browser
  // paints or the menu shows up in the wrong place for a frame. Deferring to a
  // frame callback or a ResizeObserver instead would leave the menu unplaced
  // for as long as no frames are produced, which is what happens in a
  // background tab.
  useLayoutEffect(() => {
    // A stale position is never shown, because a closed menu reports none, so
    // there is nothing to clear on the way out.
    if (!isOpen) return;

    /**
     * Re-measures the anchor, keeping the previous object when nothing moved so
     * scroll events do not each cause a render.
     * @returns {void}
     */
    function update(): void {
      const next = measure(anchorRef.current);
      setPosition((current) => (hasMoved(current, next) ? next : current));
    }

    update();
    // Capture covers scrolling inside the screen container, not just the page.
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    // Opening a menu often changes the layout around it — an itinerary step
    // expanding above it, a panel growing — which moves the anchor without any
    // scroll or resize event.
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef, isOpen]);

  // The menu is kept mounted for its ref, so a closed one must report no
  // position rather than the last one measured.
  return isOpen ? position : null;
}
