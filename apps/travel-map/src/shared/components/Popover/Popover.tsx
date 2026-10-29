import "./Popover.scss";

import { AnimatePresence, m } from "framer-motion";
import { CSSProperties, ReactNode, RefObject, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { classNames } from "@/shared/lib/classNames";
import { easeOut } from "@/shared/lib/motion";

/** Where a popover opens: under its trigger, or beside it with bottoms aligned. */
type PopoverPlacement = "below" | "beside";

/**
 * Properties accepted by the Popover component.
 * @property {DOMRect | null} anchor - The trigger's box when open, `null` when closed
 * @property {RefObject<HTMLElement | null>} triggerRef - The trigger, which keeps presses on it from closing the popover and takes focus back on Escape
 * @property {() => void} onClose - Closes the popover
 * @property {PopoverPlacement} placement - Where it opens relative to the trigger
 * @property {string} [className] - The owner's block class for its content
 * @property {ReactNode} children - The content
 */
interface PopoverProps {
  anchor: DOMRect | null;
  triggerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  placement: PopoverPlacement;
  className?: string;
  children: ReactNode;
}

/** The gap between a trigger and its popover, in pixels. */
const GAP = 8;

/**
 * Places the popover against its trigger. `below` lines the popover's right
 * edge up with the trigger's when the trigger sits on the right half of the
 * window, so it never runs off-screen; `beside` opens to the right with the
 * bottoms aligned, as the rail's tools need.
 * @param {DOMRect} anchor - The trigger's box
 * @param {PopoverPlacement} placement - Where to open
 * @returns {CSSProperties} The fixed position
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
      };
    case "below":
      return anchor.left + anchor.width / 2 > window.innerWidth / 2
        ? { right: window.innerWidth - anchor.right, top: anchor.bottom + GAP }
        : { left: anchor.left, top: anchor.bottom + GAP };
  }
}

/**
 * Popover component
 * A frosted menu opened from a trigger. It is portalled to the body because
 * an element with `backdrop-filter` only blurs what its nearest blurred
 * ancestor painted: inside the rail or a panel it would blur nothing but that
 * ancestor, never the map behind. Escape or a press elsewhere closes it, and
 * Escape hands focus back to the trigger.
 * @component
 * @param {PopoverProps} props - The popover props
 * @param {DOMRect | null} props.anchor - The trigger's box when open
 * @param {RefObject<HTMLElement | null>} props.triggerRef - The trigger
 * @param {() => void} props.onClose - Closes the popover
 * @param {PopoverPlacement} props.placement - Where it opens
 * @param {string} [props.className] - The owner's block class
 * @param {ReactNode} props.children - The content
 * @returns {ReactNode} The popover
 */
export function Popover({
  anchor,
  triggerRef,
  onClose,
  placement,
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

    /**
     * Calls the latest `onClose`, so a new callback each render does not
     * re-subscribe every listener below.
     * @returns {void}
     */
    const close = (): void => onCloseRef.current();

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
     * Closes the popover with Escape and returns focus to its trigger.
     * @param {KeyboardEvent} event - The key press
     * @returns {void}
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      close();
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", close);
    };
  }, [anchor, triggerRef]);

  return createPortal(
    <AnimatePresence>
      {anchor ? (
        <m.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={classNames("popover", `popover--${placement}`, className)}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          ref={popoverRef}
          style={positionOf(anchor, placement)}
          transition={easeOut}
        >
          {children}
        </m.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
