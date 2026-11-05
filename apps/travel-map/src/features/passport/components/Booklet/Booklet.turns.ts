import {
  animate,
  AnimationPlaybackControls,
  useReducedMotionConfig,
} from "framer-motion";
import {
  PointerEvent,
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { flushSync } from "react-dom";

import {
  cornerAlongTurn,
  hardTurnFrame,
  Lift,
  PageSize,
  Point,
  reachableCorner,
  softTurnFrame,
  turnProgress,
} from "../../lib/pageTurn";

/* A full turn's length, and the travel a drag needs before it becomes a turn. */
const TURN_MS = 700;
const DRAG_PX = 8;
/* A release this fast, in pixels a millisecond, turns the page however little it moved. */
const FLICK_SPEED = 0.35;

/**
 * The pages a turn moves, and how.
 * @property {number} target - The first page open once it is done
 * @property {HTMLElement} front - The page turning
 * @property {HTMLElement} back - What is printed on its back
 * @property {HTMLElement | null} under - The page it uncovers
 * @property {number} slotX - Where the turning page sits, in pixels from the book's left
 * @property {number} backX - Where the back lies once turned, in pixels from the book's left
 * @property {boolean} isMirrored - Whether it turns rightwards, its spine on its right
 * @property {boolean} isReversed - Whether it is a turn undone: the page comes back from over the spine
 * @property {boolean} isHard - Whether it is a cover
 * @property {Lift} lift - The corner lifted
 * @property {PageSize} size - A page's size
 */
interface Turn {
  target: number;
  front: HTMLElement;
  back: HTMLElement;
  under: HTMLElement | null;
  slotX: number;
  backX: number;
  isMirrored: boolean;
  isReversed: boolean;
  isHard: boolean;
  lift: Lift;
  size: PageSize;
}

/**
 * A pointer that is down on the book.
 * @property {number} id - The pointer's id
 * @property {Point} start - Where it came down
 * @property {Point} last - Where it was last seen
 * @property {number} time - When it was last seen
 * @property {number} speed - Its last horizontal speed, in pixels a millisecond
 * @property {Turn | null} turn - The turn it is making, once it has moved far enough
 * @property {Point} corner - Where the turn's corner is, spine on the left
 */
interface Drag {
  id: number;
  start: Point;
  last: Point;
  time: number;
  speed: number;
  turn: Turn | null;
  corner: Point;
}

/**
 * What the booklet tells its turns about itself.
 * @property {boolean[]} hardPages - Whether each page is a cover
 * @property {number} page - The first page open
 * @property {boolean} isSingle - Whether one page shows at a time
 * @property {(page: number) => void} onTurn - Told the first page open after a turn
 * @property {RefObject<HTMLDivElement | null>} bookRef - The book
 * @property {RefObject<HTMLDivElement | null>} paperRef - The blank back a lone page turns over to
 * @property {RefObject<Map<number, HTMLElement>>} pageRefs - Each mounted page, by index
 */
interface PageTurnsOptions {
  hardPages: boolean[];
  page: number;
  isSingle: boolean;
  onTurn: (page: number) => void;
  bookRef: RefObject<HTMLDivElement | null>;
  paperRef: RefObject<HTMLDivElement | null>;
  pageRefs: RefObject<Map<number, HTMLElement>>;
}

/**
 * Where the booklet is, and how to turn it.
 * @property {number[]} open - The pages showing
 * @property {boolean} canTurnBack - Whether a page lies before the open one
 * @property {boolean} canTurnOn - Whether a page lies after the open one
 * @property {(direction: 1 | -1) => void} step - Turns one page or spread
 * @property {(event: PointerEvent<HTMLDivElement>) => void} handlePointerDown - For the book's `onPointerDown`
 * @property {(event: PointerEvent<HTMLDivElement>) => void} handlePointerMove - For the book's `onPointerMove`
 * @property {(event: PointerEvent<HTMLDivElement>) => void} handlePointerUp - For the book's `onPointerUp` and `onPointerCancel`
 */
interface PageTurns {
  open: number[];
  canTurnBack: boolean;
  canTurnOn: boolean;
  step: (direction: 1 | -1) => void;
  handlePointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  handlePointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  handlePointerUp: (event: PointerEvent<HTMLDivElement>) => void;
}

/**
 * Finds the spread a page belongs to. The front cover is a spread of its own on
 * the right, and after it every left page is odd and every right page even.
 * @param {number} page - The page's index
 * @returns {number} The spread's index
 */
function spreadOf(page: number): number {
  return Math.floor((page + 1) / 2);
}

/**
 * Clears what a turn wrote onto a page and its shade.
 * @param {HTMLElement | null} element - The page
 * @returns {void}
 */
function clearTurn(element: HTMLElement | null): void {
  if (!element) return;
  element.style.cssText = "";
  const shade = element.lastElementChild;
  if (shade instanceof HTMLElement) shade.style.cssText = "";
}

/**
 * Writes a shade onto a page, in the shade element every page ends with.
 * @param {HTMLElement | null} element - The page
 * @param {string} background - The shade
 * @returns {void}
 */
function shade(element: HTMLElement | null, background: string): void {
  const layer = element?.lastElementChild;
  if (layer instanceof HTMLElement) layer.style.background = background;
}

/**
 * Draws one moment of a turn straight onto the pages: it runs every frame, so
 * it bypasses React and its renders.
 * @param {Turn} turn - The turn
 * @param {Point} corner - Where its corner is, spine on the left
 * @returns {void}
 */
function drawTurn(turn: Turn, corner: Point): void {
  const { front, back, under, size, isMirrored } = turn;
  for (const [element, layer] of [
    [under, "1"],
    [front, "2"],
    [back, "3"],
  ] as const) {
    if (!element) continue;
    element.style.visibility = "visible";
    element.style.zIndex = layer;
  }

  if (turn.isHard) {
    const frame = hardTurnFrame(turnProgress(corner, size), size, isMirrored);
    front.style.backfaceVisibility = "hidden";
    back.style.backfaceVisibility = "hidden";
    front.style.transformOrigin = frame.origin;
    front.style.transform = frame.frontTransform;
    back.style.left = `${turn.backX}px`;
    back.style.transformOrigin = frame.backOrigin;
    back.style.transform = frame.backTransform;
    shade(front, frame.shade);
    shade(back, frame.shade);
    return;
  }

  const frame = softTurnFrame(corner, turn.lift, size, isMirrored);
  front.style.clipPath = frame.frontClip;
  back.style.left = `${turn.slotX}px`;
  back.style.transformOrigin = "0 0";
  back.style.transform = frame.backTransform;
  back.style.clipPath = frame.backClip;
  shade(front, frame.frontShade);
  shade(back, frame.backShade);
  shade(under, frame.underShade);
}

/**
 * Turns the booklet's pages: from the buttons and arrow keys, and by dragging a
 * page, which curls from the corner lifted and follows the finger or pointer
 * from the moment it moves, then turns over or falls back when let go. A turn
 * writes its frames straight onto the pages, and React takes over again once
 * it lands. Under Reduce motion a turn is instant.
 * @param {PageTurnsOptions} options - The booklet's layout and elements
 * @param {boolean[]} options.hardPages - Whether each page is a cover
 * @param {number} options.page - The first page open
 * @param {boolean} options.isSingle - Whether one page shows at a time
 * @param {(page: number) => void} options.onTurn - Told the first page open after a turn
 * @param {RefObject<HTMLDivElement | null>} options.bookRef - The book
 * @param {RefObject<HTMLDivElement | null>} options.paperRef - The blank back a lone page turns over to
 * @param {RefObject<Map<number, HTMLElement>>} options.pageRefs - Each mounted page, by index
 * @returns {PageTurns} Where the booklet is, and how to turn it
 */
export function usePageTurns({
  hardPages,
  page,
  isSingle,
  onTurn,
  bookRef,
  paperRef,
  pageRefs,
}: PageTurnsOptions): PageTurns {
  const isReduced = useReducedMotionConfig() ?? false;
  const dragRef = useRef<Drag | null>(null);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const isClickSpentRef = useRef(false);
  const queuedRef = useRef<1 | -1 | null>(null);
  const stepRef = useRef<(direction: 1 | -1) => void>(() => undefined);

  const count = hardPages.length;
  const spread = isSingle ? page : spreadOf(page);
  const lastSpread = isSingle ? count - 1 : spreadOf(count - 1);
  const canTurnBack = spread > 0;
  const canTurnOn = spread < lastSpread;
  const open = isSingle
    ? [page]
    : [2 * spread - 1, 2 * spread].filter(
        (index) => index >= 0 && index < count,
      );

  /**
   * Works out what a turn in one direction moves, from the layout on screen.
   * @param {1 | -1} direction - Forwards or back
   * @param {Lift} lift - The corner to lift
   * @returns {Turn | null} The turn, or null when there is nothing that way
   */
  const planTurn = (direction: 1 | -1, lift: Lift): Turn | null => {
    const book = bookRef.current;
    const paper = paperRef.current;
    if (!book || !paper || (direction === 1 ? !canTurnOn : !canTurnBack))
      return null;
    const width = isSingle ? book.offsetWidth : book.offsetWidth / 2;
    const size = { height: book.offsetHeight, width };
    const isMirrored = direction === -1;

    /**
     * Finds a page's element, when the page exists.
     * @param {number} index - The page's index
     * @returns {HTMLElement | null} Its element
     */
    const pageAt = (index: number): HTMLElement | null =>
      pageRefs.current.get(index) ?? null;

    /*
     * A page alone is bound on its left, as a passport held open at one page:
     * forwards it turns over to the left, and back the page before comes over
     * the spine and lies down on it again, the same turn undone.
     */
    if (isSingle) {
      const turning = direction === 1 ? page : page - 1;
      const front = pageAt(turning);
      if (!front) return null;
      /* The back of a cover is board, of a page paper. */
      paper.classList.toggle(
        "booklet__page--hard",
        Boolean(hardPages[turning]),
      );
      return {
        back: paper,
        backX: -width,
        front,
        isHard: Boolean(hardPages[turning]),
        isMirrored: false,
        isReversed: direction === -1,
        lift,
        size,
        slotX: 0,
        target: page + direction,
        under: pageAt(direction === 1 ? page + 1 : page),
      };
    }

    /* Forwards the right page turns over to the left; back, the left one to the right. */
    const turning = isMirrored ? 2 * spread - 1 : 2 * spread;
    const behind = turning + direction;
    const front = pageAt(turning);
    const back = pageAt(behind);
    if (!front || !back) return null;
    return {
      back,
      backX: isMirrored ? width : 0,
      front,
      isHard: Boolean(hardPages[turning] || hardPages[behind]),
      isMirrored,
      isReversed: false,
      lift,
      size,
      slotX: isMirrored ? 0 : width,
      target: Math.max(0, 2 * (spread + direction) - 1),
      under: pageAt(behind + direction),
    };
  };

  /**
   * Ends a turn: lands it on its new page, or lays the page back down, then
   * makes any turn pressed for meanwhile.
   * @param {Turn} turn - The turn
   * @param {boolean} isTurned - Whether the page went over
   * @returns {void}
   */
  const endTurn = (turn: Turn, isTurned: boolean): void => {
    animationRef.current = null;
    /* The new spread is in place before the frames come off, so nothing flashes. */
    if (isTurned) flushSync(() => onTurn(turn.target));
    for (const element of [turn.front, turn.back, turn.under])
      clearTurn(element);
    const queued = queuedRef.current;
    queuedRef.current = null;
    /* The step from the render that just landed, which knows the new page. */
    if (queued) stepRef.current(queued);
  };

  /**
   * Carries a turn's corner from where it is to the end, over the share of a
   * full turn's time that the distance left is.
   * @param {Turn} turn - The turn
   * @param {Point} from - Where the corner is
   * @param {boolean} isTurned - Whether the page goes over or falls back
   * @param {(progress: number) => Point} [path] - The corner's way, when not straight
   * @returns {void}
   */
  const runTurn = (
    turn: Turn,
    from: Point,
    isTurned: boolean,
    path?: (progress: number) => Point,
  ): void => {
    const { width, height } = turn.size;
    /* An undone turn is done when its page lies flat again, past the spine when not. */
    const isOver = isTurned !== turn.isReversed;
    const to = {
      x: isOver ? -width : width,
      y: turn.lift === "top" ? 0 : height,
    };
    const share = Math.abs(
      turnProgress(to, turn.size) - turnProgress(from, turn.size),
    );
    if (isReduced || share === 0) {
      endTurn(turn, isTurned);
      return;
    }
    animationRef.current = animate(0, 1, {
      duration: (TURN_MS / 1000) * Math.max(0.25, share),
      ease: path ? "easeInOut" : "easeOut",
      onComplete: () => endTurn(turn, isTurned),
      onUpdate: (progress) =>
        drawTurn(
          turn,
          path
            ? path(progress)
            : {
                x: from.x + (to.x - from.x) * progress,
                y: from.y + (to.y - from.y) * progress,
              },
        ),
    });
  };

  /**
   * Turns one page or spread, as the buttons and arrow keys do. A press while a
   * page is still turning waits for it to land.
   * @param {1 | -1} direction - Forwards or back
   * @returns {void}
   */
  const step = (direction: 1 | -1): void => {
    if (dragRef.current?.turn) return;
    if (animationRef.current) {
      queuedRef.current = direction;
      return;
    }
    const turn = planTurn(direction, "bottom");
    if (!turn) return;

    /**
     * Places the corner partway through, running the turn backwards when undone.
     * @param {number} progress - How far the step has gone, from 0 to 1
     * @returns {Point} The corner
     */
    const path = (progress: number): Point =>
      cornerAlongTurn(
        turn.isReversed ? 1 - progress : progress,
        "bottom",
        turn.size,
      );
    runTurn(turn, path(0), true, path);
  };

  /* Before paint, so a step queued behind a turn runs against the page it landed on. */
  useLayoutEffect(() => {
    stepRef.current = step;
  });

  useEffect(() => {
    const book = bookRef.current;
    if (!book) return;

    /**
     * Turns the page on the bare arrow keys, except where they already mean
     * something: with a modifier (Alt+Left goes back a page in the browser), in
     * a text field, or in a radio group, where they move the choice.
     * @param {KeyboardEvent} event - The key press
     * @returns {void}
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          'input, textarea, select, [contenteditable="true"], [role="radiogroup"]',
        )
      )
        return;
      stepRef.current(event.key === "ArrowRight" ? 1 : -1);
    };

    /**
     * Swallows the click that ends a mouse drag, so a turn that started on a
     * stamp does not also press it.
     * @param {MouseEvent} event - The click
     * @returns {void}
     */
    const handleClick = (event: MouseEvent): void => {
      if (!isClickSpentRef.current) return;
      isClickSpentRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("keydown", handleKeyDown);
    book.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      book.removeEventListener("click", handleClick, true);
      animationRef.current?.stop();
    };
  }, [bookRef]);

  /**
   * Notes where a pointer came down; it becomes a turn only once it moves.
   * @param {PointerEvent<HTMLDivElement>} event - The pointer going down
   * @returns {void}
   */
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (!event.isPrimary || event.button !== 0 || animationRef.current) return;
    /* A touch drag ends with no click to swallow, so a new press starts afresh. */
    isClickSpentRef.current = false;
    const point = { x: event.clientX, y: event.clientY };
    dragRef.current = {
      corner: point,
      id: event.pointerId,
      last: point,
      speed: 0,
      start: point,
      time: event.timeStamp,
      turn: null,
    };
  };

  /**
   * Starts a turn once the pointer has moved sideways far enough, then keeps the
   * lifted corner under it.
   * @param {PointerEvent<HTMLDivElement>} event - The pointer moving
   * @returns {void}
   */
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    const book = bookRef.current;
    if (!drag || !book || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.start.x;
    const dy = event.clientY - drag.start.y;
    const elapsed = event.timeStamp - drag.time;
    if (elapsed > 0) drag.speed = (event.clientX - drag.last.x) / elapsed;
    drag.last = { x: event.clientX, y: event.clientY };
    drag.time = event.timeStamp;

    if (!drag.turn) {
      if (Math.abs(dx) < DRAG_PX || Math.abs(dx) < Math.abs(dy)) return;
      const bounds = book.getBoundingClientRect();
      const lift =
        drag.start.y - bounds.top < bounds.height / 2 ? "top" : "bottom";
      drag.turn = planTurn(dx < 0 ? 1 : -1, lift);
      if (!drag.turn) {
        dragRef.current = null;
        return;
      }
      book.setPointerCapture(event.pointerId);
    }

    const { size, isMirrored, isReversed, lift } = drag.turn;
    /*
     * A lifted corner follows the finger; a page coming back is held by its
     * fold, which lies halfway to the corner, so the corner moves twice as far.
     */
    drag.corner = reachableCorner(
      {
        x: isReversed
          ? -size.width + 2 * dx
          : size.width + (isMirrored ? -dx : dx),
        y: (lift === "top" ? 0 : size.height) + dy,
      },
      lift,
      size,
    );
    drawTurn(drag.turn, drag.corner);
  };

  /**
   * Lets go: a page past halfway, or flicked its way, turns over; any other
   * falls back. A pointer that never moved far enough was a press, and its
   * click goes through.
   * @param {PointerEvent<HTMLDivElement>} event - The pointer going up
   * @returns {void}
   */
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    if (!drag.turn) return;
    isClickSpentRef.current = true;
    const { isMirrored, isReversed, size } = drag.turn;
    const towards = isMirrored || isReversed ? drag.speed : -drag.speed;
    /* How far towards done, whichever way done lies. */
    const progress = isReversed
      ? 1 - turnProgress(drag.corner, size)
      : turnProgress(drag.corner, size);
    const isTurned =
      event.type !== "pointercancel" &&
      (progress > 0.5 || (towards > FLICK_SPEED && progress > 0.02));
    runTurn(drag.turn, drag.corner, isTurned);
  };

  return {
    canTurnBack,
    canTurnOn,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    open,
    step,
  };
}
