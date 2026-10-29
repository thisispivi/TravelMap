import { RefObject, useEffect, useState } from "react";

/* Scrolled this far, a header counts as scrolled past its resting state. */
const SCROLLED_PX = 24;
/*
 * A header that condenses grows the body by about this much. A body with less
 * room to scroll than this would clamp back under the threshold the moment
 * the header shrank, and the header would flicker between its two states.
 */
const CONDENSE_ROOM_PX = 96;
/* Once scrolled, the state holds until the body is back this close to its top. */
const RESTING_PX = 4;
/* A section counts as current once its top is this close to the scroller's. */
const SECTION_SLACK_PX = 8;

/**
 * Scroll state returned by `useScrollState`.
 * @property {boolean} isScrolled - Whether the body has scrolled past its top
 * @property {number} activeIndex - Which tracked section is at the top; minus one when nothing is tracked
 */
export interface ScrollState {
  isScrolled: boolean;
  activeIndex: number;
}

/**
 * Follows a scrolling body: whether it has left its top, and which of its
 * sections (matched by `selector`) currently sits at the top. Panels use it to
 * show "where you are" in their header instead of pinning headings inside the
 * scrolling content.
 * @param {RefObject<HTMLElement | null>} bodyRef - The scrolling element
 * @param {string} [selector] - Matches the sections to track, when there are any
 * @returns {ScrollState} The scroll state
 */
export function useScrollState(
  bodyRef: RefObject<HTMLElement | null>,
  selector?: string,
): ScrollState {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selector ? 0 : -1);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    let frame = 0;

    /**
     * Reads the scroll position once per frame, however often scroll fires.
     * @returns {void}
     */
    const handleScroll = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const room = body.scrollHeight - body.clientHeight;
        setIsScrolled((wasScrolled) =>
          wasScrolled
            ? body.scrollTop > RESTING_PX
            : body.scrollTop > SCROLLED_PX && room > CONDENSE_ROOM_PX,
        );
        if (!selector) return;
        const top = body.getBoundingClientRect().top + SECTION_SLACK_PX;
        const sections = [...body.querySelectorAll(selector)];
        const passed = sections.findLastIndex(
          (section) => section.getBoundingClientRect().top <= top,
        );
        setActiveIndex(Math.max(passed, 0));
      });
    };

    handleScroll();
    body.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      body.removeEventListener("scroll", handleScroll);
    };
  }, [bodyRef, selector]);

  return { activeIndex, isScrolled };
}
