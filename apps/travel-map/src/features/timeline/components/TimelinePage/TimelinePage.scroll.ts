import { remToPx } from "@travelmap/ui/lib/rem";
import { useReducedMotion, useScroll, useSpring } from "framer-motion";
import { RefObject, useEffect, useRef } from "react";

import {
  isLeftOfLine,
  lengthShareAt,
  lineWindow,
  routePath,
  routeX,
  stopPose,
} from "../../lib/timeline";

/* A phone keeps the line in a gutter beside the cards; these match its width. */
const COMPACT_CENTRE_REM = 1.375;
const COMPACT_SWAY_REM = 0.5625;
/* The narrowest and widest the line swings on a wider screen, either side. */
const MIN_SWAY_REM = 1.375;
const MAX_SWAY_REM = 13.625;
/* The share of a side's spare room the line swings into, leaving the rest empty. */
const SWAY_SHARE = 0.68;
/* Matches the room the stylesheet leaves between a card and the line. */
const LINE_ROOM_REM = 3;
/* How many points along the line are read to tell how far down each one lies. */
const LINE_SAMPLES = 400;
/* The spring between the scroll and the page, so a wheel's steps do not show. */
const SCRUB = { damping: 30, stiffness: 160 };

/**
 * What the timeline's scroll playback works on.
 * @property {RefObject<HTMLDivElement | null>} bodyRef - The scrolling element
 * @property {RefObject<HTMLDivElement | null>} routeRef - The route holding the stops
 * @property {RefObject<SVGPathElement | null>} pathRef - The line through the stops
 * @property {boolean} isCompact - Whether the line keeps to a phone's gutter
 */
interface TimelineScrollOptions {
  bodyRef: RefObject<HTMLDivElement | null>;
  routeRef: RefObject<HTMLDivElement | null>;
  pathRef: RefObject<SVGPathElement | null>;
  isCompact: boolean;
}

/**
 * Lays the line through the stops and plays the page as the reader scrolls, in
 * both directions, writing straight to the DOM so a scroll costs no React render.
 * @param {TimelineScrollOptions} options - What it works on
 * @param {RefObject<HTMLDivElement | null>} options.bodyRef - The scrolling element
 * @param {RefObject<HTMLDivElement | null>} options.routeRef - The route holding the stops
 * @param {RefObject<SVGPathElement | null>} options.pathRef - The line through the stops
 * @param {boolean} options.isCompact - Whether the line keeps to a phone's gutter
 * @returns {void}
 */
export function useTimelineScroll({
  bodyRef,
  routeRef,
  pathRef,
  isCompact,
}: TimelineScrollOptions): void {
  const isReduced = useReducedMotion() ?? false;
  const { scrollY } = useScroll({ container: bodyRef });
  const scrub = useSpring(scrollY, SCRUB);
  /* Outlives the effect, so crossing a breakpoint does not replay the entrance. */
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    const body = bodyRef.current;
    const route = routeRef.current;
    const path = pathRef.current;
    if (!body || !route || !path) return;
    const items = [...route.querySelectorAll(".timeline-page__item")];
    const cards = items.map((item) =>
      item.querySelector<HTMLElement>(".timeline-page__stop"),
    );
    const dots = items.map((item) =>
      item.querySelector<HTMLElement>(".timeline-page__dot"),
    );
    const labels = [...route.querySelectorAll(".timeline-page__year-label")];
    let tops: number[] = [];
    let height = 0;
    let routeTop = 0;
    let routeHeight = 1;
    let lineHeights: number[] = [];

    /**
     * Moves everything to where the scroll puts it, written straight to the DOM
     * because this runs on every frame of a scroll: one loop over the stops, no
     * React render, and nothing written for a stop that is off screen and stays
     * there. A card off screen is only transparent, never hidden, so the keyboard
     * and screen readers can still reach it, and focusing it scrolls it into view.
     * @returns {void}
     */
    const paint = (): void => {
      const scroll = scrub.get();
      const viewport = body.clientHeight;
      const { tip, tail } = lineWindow({
        maxScroll: body.scrollHeight - viewport,
        routeHeight,
        routeTop,
        scroll,
        viewport,
      });
      const tipShare = lengthShareAt(lineHeights, tip * routeHeight);
      const tailShare = lengthShareAt(lineHeights, tail * routeHeight);
      path.style.strokeDasharray = `${Math.max(tipShare - tailShare, 0)} 1`;
      path.style.strokeDashoffset = `${-tailShare}`;
      tops.forEach((top, index) => {
        const card = cards[index];
        const dot = dots[index];
        if (!card || !dot) return;
        const pose = stopPose({
          height,
          isLeft: isLeftOfLine(index, isCompact),
          isReduced,
          scroll,
          top,
          viewport,
        });
        if (pose.opacity === 0 && card.style.opacity === "0") return;
        card.style.opacity = `${pose.opacity}`;
        card.style.transform = `translate3d(${pose.x}rem, ${pose.y}rem, 0) rotate(${pose.rotate}deg) scale(${pose.scale})`;
        dot.style.transform = `scale(${pose.opacity})`;
      });
    };

    /**
     * Finds where each stop lies and lays the line through the stops and the year
     * markers. The wider the page, the further the line swings, as far as the
     * cards leave room for; each card and dot moves with it, so a card stays
     * beside the line. It reads the list items because the cards themselves move.
     * The first time, the page plays in as if scrolled up from below.
     * @returns {void}
     */
    const measure = (): void => {
      const { top: bodyTop } = body.getBoundingClientRect();
      const { top: routeBoxTop } = route.getBoundingClientRect();
      const centre = isCompact
        ? remToPx(COMPACT_CENTRE_REM)
        : route.clientWidth / 2;
      const room =
        centre - remToPx(LINE_ROOM_REM) - (cards[0]?.offsetWidth ?? 0);
      const reach = Math.min(
        Math.max(room, 0) * SWAY_SHARE,
        remToPx(MAX_SWAY_REM),
      );
      const sway = isCompact
        ? remToPx(COMPACT_SWAY_REM)
        : Math.max(reach, remToPx(MIN_SWAY_REM));
      const boxes = items.map((item) => item.getBoundingClientRect());
      routeTop = routeBoxTop - bodyTop + body.scrollTop;
      routeHeight = Math.max(route.offsetHeight, 1);
      height = boxes[0]?.height ?? 0;
      tops = boxes.map((box) => box.top - bodyTop + body.scrollTop);
      const stopPoints = boxes.map((box, index) => ({
        x: routeX(index, centre, sway),
        y: box.top + box.height / 2 - routeBoxTop,
      }));
      const labelPoints = labels.map((label) => {
        const box = label.getBoundingClientRect();
        return { x: centre, y: box.top + box.height / 2 - routeBoxTop };
      });
      path.setAttribute(
        "d",
        routePath(
          [...stopPoints, ...labelPoints].sort(
            (first, second) => first.y - second.y,
          ),
        ),
      );
      const total = path.getTotalLength();
      lineHeights = Array.from(
        { length: LINE_SAMPLES + 1 },
        (_, sample) => path.getPointAtLength((total * sample) / LINE_SAMPLES).y,
      );
      stopPoints.forEach(({ x }, index) => {
        const card = cards[index];
        const dot = dots[index];
        if (!card || !dot) return;
        dot.style.left = `${x}px`;
        /* Short of the full swing, a card keeps to the room its side has. */
        const shift = Math.max(Math.min(x - centre, reach), -reach);
        card.style.left = isCompact ? "0" : `${shift}px`;
      });
      if (!hasPlayedRef.current && !isReduced) {
        hasPlayedRef.current = true;
        scrub.jump(body.scrollTop - body.clientHeight);
        scrub.set(body.scrollTop);
      }
      paint();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(route);
    /* A taller window leaves the route's size alone but brings more stops on screen. */
    observer.observe(body);
    const unsubscribe = scrub.on("change", paint);
    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, [bodyRef, isCompact, isReduced, pathRef, routeRef, scrub]);
}
