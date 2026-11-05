import {
  FocusEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * What a tooltip is showing.
 * @property {string} key - Which trigger it belongs to
 * @property {DOMRect} anchor - That trigger's box
 * @property {ReactNode} content - What it says
 */
export interface TooltipTip {
  key: string;
  anchor: DOMRect;
  content: ReactNode;
}

/** How long a finger must rest on a trigger with its own action to show its tooltip. */
const HOLD_MS = 450;

/** How far a resting finger may drift, in pixels, before it counts as a drag. */
const HOLD_SLOP_PX = 8;

/**
 * The handlers that make an element show a tooltip.
 * @property {(event: PointerEvent<Element>) => void} onPointerDown - Notes the pointer, and starts timing a finger's hold
 * @property {(event: PointerEvent<Element>) => void} onPointerMove - Gives up the hold once the finger drags
 * @property {() => void} onPointerUp - Ends the hold
 * @property {() => void} onPointerCancel - Ends the hold
 * @property {(event: PointerEvent<Element>) => void} onPointerEnter - Shows the tooltip under a mouse
 * @property {(event: PointerEvent<Element>) => void} onPointerLeave - Hides it when the mouse leaves, and ends a hold
 * @property {(event: MouseEvent<Element>) => void} onContextMenu - Keeps a long press from opening the browser's menu
 * @property {(event: FocusEvent<Element>) => void} onFocus - Shows it to a keyboard
 * @property {() => void} onBlur - Hides it when focus moves on
 * @property {(event: MouseEvent<Element>) => void} onClick - Runs the trigger's action, or shows the tooltip on a tap
 */
interface TooltipTriggerProps {
  onPointerDown: (event: PointerEvent<Element>) => void;
  onPointerMove: (event: PointerEvent<Element>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onPointerEnter: (event: PointerEvent<Element>) => void;
  onPointerLeave: (event: PointerEvent<Element>) => void;
  onContextMenu: (event: MouseEvent<Element>) => void;
  onFocus: (event: FocusEvent<Element>) => void;
  onBlur: () => void;
  onClick: (event: MouseEvent<Element>) => void;
}

/**
 * What `useTooltip` returns.
 * @property {TooltipTip | null} tip - The tooltip showing, for `Tooltip` to draw
 * @property {(key: string, content: ReactNode, onActivate?: () => void) => TooltipTriggerProps} triggerProps - The handlers for one trigger, and what pressing it does, if anything
 */
interface UseTooltipReturn {
  tip: TooltipTip | null;
  triggerProps: (
    key: string,
    content: ReactNode,
    onActivate?: () => void,
  ) => TooltipTriggerProps;
}

/**
 * Drives one tooltip shared by many triggers, such as the bars of a chart. A
 * mouse shows it on hover and a keyboard on focus. A finger has no hover: on a
 * trigger with nothing else to do a tap shows it, and on one with an action of
 * its own, such as a stamp, the tap keeps that action and holding the finger
 * still shows the tooltip instead. A tap anywhere else, a scroll or Escape
 * hides it.
 * @returns {UseTooltipReturn} The tooltip and its trigger handlers
 */
export function useTooltip(): UseTooltipReturn {
  const [tip, setTip] = useState<TooltipTip | null>(null);
  const isTouchRef = useRef(false);
  const triggerRef = useRef<Element | null>(null);
  const holdRef = useRef<{ timer: number; x: number; y: number } | null>(null);
  const wasHeldRef = useRef(false);

  useEffect(() => {
    if (!tip) return;

    /**
     * Hides the tooltip.
     * @returns {void}
     */
    const close = (): void => setTip(null);

    /**
     * Hides the tooltip on a press anywhere but its own trigger, which decides
     * for itself what a press does.
     * @param {globalThis.PointerEvent} event - The press
     * @returns {void}
     */
    const handlePointerDown = (event: globalThis.PointerEvent): void => {
      if (
        event.target instanceof Node &&
        triggerRef.current?.contains(event.target)
      )
        return;
      close();
    };

    /**
     * Hides the tooltip with Escape.
     * @param {KeyboardEvent} event - The key press
     * @returns {void}
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      isTouchRef.current = false;
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", close, { capture: true, passive: true });
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, { capture: true });
    };
  }, [tip]);

  useEffect(() => () => window.clearTimeout(holdRef.current?.timer), []);

  /**
   * Shows the tooltip against a trigger.
   * @param {string} key - The trigger
   * @param {Element} element - Its element
   * @param {ReactNode} content - What the tooltip says
   * @returns {void}
   */
  const show = (key: string, element: Element, content: ReactNode): void => {
    triggerRef.current = element;
    setTip({ anchor: element.getBoundingClientRect(), content, key });
  };

  /**
   * Gives up timing a hold, when the finger lifts, leaves or drags.
   * @returns {void}
   */
  const endHold = (): void => {
    window.clearTimeout(holdRef.current?.timer);
    holdRef.current = null;
  };

  return {
    tip,
    triggerProps: (key, content, onActivate) => ({
      onBlur: () => setTip(null),
      onClick: (event) => {
        /* The press that showed the tooltip is not also a tap. */
        if (wasHeldRef.current) {
          wasHeldRef.current = false;
          return;
        }
        if (onActivate) onActivate();
        else if (isTouchRef.current && tip?.key !== key)
          show(key, event.currentTarget, content);
      },
      onContextMenu: (event) => {
        if (onActivate && isTouchRef.current) event.preventDefault();
      },
      onFocus: (event) => {
        if (!isTouchRef.current) show(key, event.currentTarget, content);
      },
      onPointerCancel: endHold,
      onPointerDown: (event) => {
        isTouchRef.current = event.pointerType !== "mouse";
        wasHeldRef.current = false;
        if (!onActivate || !isTouchRef.current) return;
        const element = event.currentTarget;
        endHold();
        holdRef.current = {
          timer: window.setTimeout(() => {
            wasHeldRef.current = true;
            show(key, element, content);
          }, HOLD_MS),
          x: event.clientX,
          y: event.clientY,
        };
      },
      onPointerEnter: (event) => {
        if (event.pointerType === "mouse")
          show(key, event.currentTarget, content);
      },
      onPointerLeave: (event) => {
        endHold();
        if (event.pointerType === "mouse") setTip(null);
      },
      onPointerMove: (event) => {
        const hold = holdRef.current;
        if (
          hold &&
          Math.hypot(event.clientX - hold.x, event.clientY - hold.y) >
            HOLD_SLOP_PX
        )
          endHold();
      },
      onPointerUp: endHold,
    }),
  };
}
