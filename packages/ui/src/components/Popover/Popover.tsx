import "./Popover.scss";

import { AnimatePresence, m } from "framer-motion";
import { CSSProperties, ReactNode, RefObject, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { fitVertically } from "../../lib/anchor";
import { classNames } from "../../lib/classNames";
import { focusablesIn, keepTabWithin } from "../../lib/focus";
import { menuVariants } from "../../lib/motion";

/** Where a popover opens: under its trigger, or beside it with bottoms aligned. */
type PopoverPlacement = "below" | "beside";

/**
 * Properties accepted by the Popover component.
 * @property {DOMRect | null} anchor - The trigger's box when open, `null` when closed
 * @property {RefObject<HTMLElement | null>} triggerRef - The trigger, which keeps presses on it from closing the popover and takes focus back on close
 * @property {() => void} onClose - Closes the popover
 * @property {PopoverPlacement} placement - Where it opens relative to the trigger
 * @property {string} label - The accessible name of the menu
 * @property {string} [className] - The owner's block class for its content
 * @property {ReactNode} children - The content
 */
interface PopoverProps {
  anchor: DOMRect | null;
  triggerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  placement: PopoverPlacement;
  label: string;
  className?: string;
  children: ReactNode;
}

/** The gap between a trigger and its popover, in pixels. */
const GAP = 8;

/** The tallest a popover grows before its list scrolls. */
const MAX_HEIGHT = "24rem";

/** Less room than this under the trigger, in pixels, and the popover opens above it. */
const MIN_ROOM_PX = 240;

/**
 * Places the popover against its trigger and caps its height at the room the
 * window leaves, so a trigger low on a phone never pushes the list off-screen;
 * the list scrolls instead, or opens above the trigger when below leaves only
 * a sliver. `below` lines the popover's right edge up with the trigger's when
 * the trigger sits on the right half of the window; `beside`
 * opens to the right with the bottoms aligned and grows upwards, as the rail's
 * tools need.
 * @param {DOMRect} anchor - The trigger's box
 * @param {PopoverPlacement} placement - Where to open
 * @returns {CSSProperties} The fixed position and height cap
 */
function positionOf(
  anchor: DOMRect,
  placement: PopoverPlacement,
): CSSProperties {
  switch (placement) {
    case "beside":
      return {
        bottom: window.innerHeight - anchor.bottom,
        left: anchor.right + GAP,
        maxHeight: `min(${MAX_HEIGHT}, ${anchor.bottom - GAP * 2}px)`,
      };
    case "below": {
      const { opensUp, room } = fitVertically(anchor, GAP, MIN_ROOM_PX);
      const vertical = opensUp
        ? {
            bottom: window.innerHeight - anchor.top + GAP,
            maxHeight: `min(${MAX_HEIGHT}, ${room}px)`,
          }
        : {
            maxHeight: `min(${MAX_HEIGHT}, ${room}px)`,
            top: anchor.bottom + GAP,
          };
      return anchor.left + anchor.width / 2 > window.innerWidth / 2
        ? { ...vertical, right: window.innerWidth - anchor.right }
        : { ...vertical, left: anchor.left };
    }
  }
}

/**
 * Popover component
 * A frosted menu opened from a trigger. It is portalled to the body because
 * an element with `backdrop-filter` only blurs what its nearest blurred
 * ancestor painted: inside the rail or a panel it would blur nothing but that
 * ancestor, never the map behind. Opening moves focus into it and Tab cycles
 * through its controls; Escape or a press elsewhere closes it, and focus left
 * inside returns to the trigger.
 * @component
 * @param {PopoverProps} props - The popover props
 * @param {DOMRect | null} props.anchor - The trigger's box when open
 * @param {RefObject<HTMLElement | null>} props.triggerRef - The trigger
 * @param {() => void} props.onClose - Closes the popover
 * @param {PopoverPlacement} props.placement - Where it opens
 * @param {string} props.label - The accessible name of the menu
 * @param {string} [props.className] - The owner's block class
 * @param {ReactNode} props.children - The content
 * @returns {ReactNode} The popover
 */
export function Popover({
  anchor,
  triggerRef,
  onClose,
  placement,
  label,
  className,
  children,
}: PopoverProps): ReactNode {
  const popoverRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!anchor) return;
    const popover = popoverRef.current;
    const trigger = triggerRef.current;
    const openWidth = window.innerWidth;
    /*
     * Portalled to the end of the body, the popover sits after everything else
     * in tab order, so focus is carried into it rather than left behind.
     */
    focusablesIn(popover)[0]?.focus({ preventScroll: true });

    /**
     * Calls the latest `onClose`, so a new callback each render does not
     * re-subscribe every listener below.
     * @returns {void}
     */
    const close = (): void => onCloseRef.current();

    /**
     * Closes the popover once the window changes width, which moves its
     * trigger. Phones change only the height as their toolbars and keyboard
     * slide, which leaves the trigger where it was.
     * @returns {void}
     */
    const handleResize = (): void => {
      if (window.innerWidth !== openWidth) close();
    };

    /**
     * Closes the popover on a press outside both it and its trigger.
     * @param {PointerEvent} event - The press
     * @returns {void}
     */
    const handlePointerDown = (event: PointerEvent): void => {
      if (
        event.target instanceof Node &&
        (popoverRef.current?.contains(event.target) ||
          triggerRef.current?.contains(event.target))
      )
        return;
      close();
    };

    /**
     * Closes the popover with Escape, and
     * keeps Tab cycling through its controls instead of escaping to the end
     * of the page.
     * @param {KeyboardEvent} event - The key press
     * @returns {void}
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        close();
        return;
      }
      keepTabWithin(event, popoverRef.current);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      /*
       * Closing by picking an option unmounts the focused button; hand focus
       * back to the trigger rather than letting it fall to the page. A press
       * elsewhere has already moved focus out, so it is left there.
       */
      if (popover?.contains(document.activeElement)) trigger?.focus();
    };
  }, [anchor, triggerRef]);

  return createPortal(
    <AnimatePresence>
      {anchor ? (
        <m.div
          animate="animate"
          aria-label={label}
          className={classNames("popover", `popover--${placement}`, className)}
          exit="exit"
          initial="initial"
          ref={popoverRef}
          role="dialog"
          style={positionOf(anchor, placement)}
          variants={menuVariants}
        >
          {children}
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
