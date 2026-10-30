import "./useAnchoredMenu.scss";

import { RefObject, useEffect, useLayoutEffect, useState } from "react";

import { fitVertically } from "../lib/anchor";
import { remToPx } from "../lib/rem";

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

/**
 * Measures an anchor and places the menu under it, or above it when below
 * has too little room, as wide as the anchor.
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
  const gap = remToPx(MENU_GAP_REM);
  const maxHeight = remToPx(MENU_MAX_HEIGHT_REM);
  const width = Math.min(
    Math.max(rect.width, preferredWidth ?? rect.width),
    window.innerWidth - gap * 2,
  );
  const { opensUp, room } = fitVertically(rect, gap, maxHeight);

  return {
    left: Math.min(Math.max(gap, rect.left), window.innerWidth - width - gap),
    maxHeight: Math.min(maxHeight, room),
    placement: opensUp ? "top" : "bottom",
    top: opensUp ? rect.top - gap : rect.bottom + gap,
    width,
  };
}

/**
 * Makes the detached layer one menu is drawn in when its control sits in a
 * dialog. The dialog's frosted glass is a `backdrop-filter`, which turns it
 * into the containing block of every fixed descendant: a menu portalled
 * straight into it would be placed against the dialog instead of the window
 * and clipped by its scrolling, growing a scrollbar rather than showing. A
 * popover sits in the top layer, above the dialog and outside its box, while
 * staying inside its DOM, where a modal dialog keeps its controls interactive.
 * Each menu has its own, so one closing never hides another.
 * @returns {HTMLDivElement} The layer, not yet in the document
 */
function createMenuLayer(): HTMLDivElement {
  const layer = document.createElement("div");
  layer.className = "anchored-layer";
  layer.popover = "manual";
  return layer;
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
 * edge. Menus are therefore portalled to the body, or to their own top-layer
 * layer inside a dialog, and positioned here, against the viewport, flipping above the
 * anchor when there is more room there.
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
  const [layer] = useState(createMenuLayer);

  /* The first measurement must precede paint to avoid an incorrectly placed frame. */
  useLayoutEffect(() => {
    if (!isOpen) return;
    const dialog = anchorRef.current?.closest("dialog");
    if (dialog) {
      if (layer.parentElement !== dialog) dialog.append(layer);
      layer.showPopover();
    }
    setContainer(dialog ? layer : document.body);

    /**
     * Re-measures the anchor, keeping the previous object when nothing moved so
     * scroll events do not each cause a render.
     * @returns {void}
     */
    function update(): void {
      const next = measure(anchorRef.current, preferredWidth);
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
      if (layer.matches(":popover-open")) layer.hidePopover();
    };
  }, [anchorRef, isOpen, layer, preferredWidth]);

  useEffect(() => () => layer.remove(), [layer]);

  return { container, position: isOpen ? position : null };
}
