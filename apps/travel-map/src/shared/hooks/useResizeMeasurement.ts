import { RefObject, useEffect, useRef } from "react";

/**
 * Runs `measure` once on mount and again whenever the observed element
 * resizes or the window resizes (the latter catches viewport-driven
 * `max-height` changes that don't themselves change the element's own box
 * size, so a `ResizeObserver` alone would miss them). Always calls the
 * latest `measure` closure and coalesces bursts of resize events into a
 * single `requestAnimationFrame` callback.
 * @param {RefObject<HTMLElement | null>} elementRef - Ref to the element to observe
 * @param {() => void} measure - Callback invoked on mount and on resize
 * @returns {void}
 */
export function useResizeMeasurement(
  elementRef: RefObject<HTMLElement | null>,
  measure: () => void,
): void {
  const measureRef = useRef(measure);

  useEffect(() => {
    measureRef.current = measure;
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let frame = window.requestAnimationFrame(() => measureRef.current());

    /**
     * Cancels any pending measurement frame and queues a new one, so rapid
     * layout changes only trigger one remeasure.
     * @returns {void}
     */
    const schedule = (): void => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => measureRef.current());
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [elementRef]);
}
