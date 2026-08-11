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

/**
 * Placement and portal host for a floating control panel.
 * @property {Element} container - Portal host in the control's top layer
 * @property {MenuPosition | null} position - Viewport placement while open
 */
export interface AnchoredMenuState {
  container: Element;
  position: MenuPosition | null;
}

const MENU_GAP_REM = 0.25;
const MENU_MAX_HEIGHT_REM = 22;
const REM_IN_PX = 16;

/** Shared animation states for anchored editor panels. */
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
 * @param {number} [preferredWidth] - Minimum panel width in pixels
 * @returns {MenuPosition | null} The position, when the anchor is mounted
 */
function measure(
  anchor: HTMLElement | null,
  preferredWidth?: number,
): MenuPosition | null {
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const gap = MENU_GAP_REM * REM_IN_PX;
  const maxHeight = MENU_MAX_HEIGHT_REM * REM_IN_PX;
  const width = Math.min(
    Math.max(rect.width, preferredWidth ?? rect.width),
    window.innerWidth - gap * 2,
  );
  const below = window.innerHeight - rect.bottom - gap * 2;
  const above = rect.top - gap * 2;
  const opensUp = below < maxHeight && above > below;

  return {
    left: Math.min(Math.max(gap, rect.left), window.innerWidth - width - gap),
    maxHeight: Math.max(0, Math.min(maxHeight, opensUp ? above : below)),
    placement: opensUp ? "top" : "bottom",
    top: opensUp ? rect.top - gap : rect.bottom + gap,
    width,
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
 * @param {number} [preferredWidth] - Minimum panel width in pixels
 * @returns {AnchoredMenuState} The portal host and current position
 */
export function useAnchoredMenu(
  anchorRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  preferredWidth?: number,
): AnchoredMenuState {
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [container, setContainer] = useState<Element>(document.body);

  /* The first measurement must precede paint to avoid an incorrectly placed frame. */
  useLayoutEffect(() => {
    if (!isOpen) return;

    /**
     * Re-measures the anchor, keeping the previous object when nothing moved so
     * scroll events do not each cause a render.
     * @returns {void}
     */
    function update(): void {
      const anchor = anchorRef.current;
      const next = measure(anchor, preferredWidth);
      setContainer(anchor?.closest("dialog") ?? document.body);
      setPosition((current) => (hasMoved(current, next) ? next : current));
    }

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef, isOpen, preferredWidth]);

  return { container, position: isOpen ? position : null };
}
